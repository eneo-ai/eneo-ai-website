/**
 * Inkrementell översättning av epic-titlar och -sammanfattningar till svenska.
 *
 * Cachen (data/roadmap-translations.json) är keyad på epicens issue-nummer och
 * en sha256-hash av title + NUL + summary. Status, grupp, datum m.m. ingår
 * ALDRIG i hashen — en epic översätts endast om dess läsbara innehåll ändras,
 * medan status-/gruppändringar publiceras direkt utan nya AI-anrop.
 * (ROADMAP_WEBSITE_HANDOFF.md §5)
 */

import { createHash } from 'node:crypto';

export class TranslationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TranslationError';
    }
}

/** Hash av det översättningsbara innehållet. Saknad summary normaliseras till "". */
export function contentHash(title, summary) {
    return createHash('sha256')
        .update(`${title}\u0000${summary ?? ''}`, 'utf8')
        .digest('hex');
}

/**
 * Deterministisk serialisering av cachen: numeriskt sorterade nycklar,
 * 2 mellanslag indrag, avslutande radbrytning — så att oförändrat innehåll
 * ger en byte-identisk fil och inga onödiga commits.
 */
export function serializeCache(cache) {
    const sortedEntries = {};
    for (const key of Object.keys(cache.entries).sort((a, b) => Number(a) - Number(b))) {
        const { hash, title, summary } = cache.entries[key];
        sortedEntries[key] = { hash, title, summary };
    }
    return `${JSON.stringify({ cacheVersion: 1, entries: sortedEntries }, null, 2)}\n`;
}

/** Läs och sanity-kontrollera en cache som lästs från disk. */
export function normalizeCache(raw) {
    if (raw === null || raw === undefined) {
        return { cacheVersion: 1, entries: {} };
    }
    if (typeof raw !== 'object' || raw.cacheVersion !== 1
        || typeof raw.entries !== 'object' || raw.entries === null) {
        throw new TranslationError('Översättningscachen har okänt format — vägrar fortsätta');
    }
    return { cacheVersion: 1, entries: { ...raw.entries } };
}

/**
 * Översätt alla items, med cache. Poster för issues som inte längre finns i
 * exporten rensas (en återuppdykande epic med oförändrad text översätts om en
 * gång — medveten avvägning för att hålla cachen ren).
 *
 * @param {Array} items - Validerade items från källexporten
 * @param {object} cache - Normaliserad cache ({cacheVersion, entries})
 * @param {(input: {title: string, summary: string|null}) => Promise<{title: string, summary?: string}>} callModel
 *   Injicerad modell-anropare (riktigt Anthropic-anrop i produktion, stub i test)
 * @returns {Promise<{translations: Map<number, {title: string, summary: string|null}>, cache: object, warnings: string[], apiCalls: number}>}
 */
export async function translateItems(items, cache, callModel) {
    const translations = new Map();
    const newEntries = {};
    const warnings = [];
    let apiCalls = 0;

    for (const item of items) {
        const key = String(item.number);
        const hasSummary = typeof item.summary === 'string' && item.summary.trim() !== '';
        const hash = contentHash(item.title, hasSummary ? item.summary : '');

        const cached = cache.entries[key];
        if (cached && cached.hash === hash) {
            newEntries[key] = cached;
            translations.set(item.number, {
                title: cached.title,
                summary: cached.summary === '' ? null : cached.summary,
            });
            continue;
        }

        if (!hasSummary) {
            warnings.push(`Epic #${item.number} saknar Summary – visas utan beskrivning`);
        }

        const result = await callModel({
            title: item.title,
            summary: hasSummary ? item.summary : null,
        });
        apiCalls++;

        // Publicera aldrig tom, halvöversatt eller påhittad text — ogiltigt svar
        // fäller hela körningen (handoff §5).
        if (typeof result?.title !== 'string' || result.title.trim() === '') {
            throw new TranslationError(`Ogiltig AI-översättning för epic #${item.number}: titel saknas`);
        }
        let summarySv = '';
        if (hasSummary) {
            if (typeof result.summary !== 'string' || result.summary.trim() === '') {
                throw new TranslationError(`Ogiltig AI-översättning för epic #${item.number}: sammanfattning saknas`);
            }
            summarySv = result.summary.trim();
        }

        const entry = { hash, title: result.title.trim(), summary: summarySv };
        newEntries[key] = entry;
        translations.set(item.number, {
            title: entry.title,
            summary: entry.summary === '' ? null : entry.summary,
        });
    }

    return {
        translations,
        cache: { cacheVersion: 1, entries: newEntries },
        warnings,
        apiCalls,
    };
}

const SYSTEM_PROMPT = `Du översätter titlar och sammanfattningar för epics (funktioner) i AI-plattformen Eneo, från engelska till svenska, för publicering på en offentlig roadmap på eneo.ai.

Krav:
- Saklig, korrekt svenska för offentlig sektor.
- Samma innebörd och ambitionsnivå som originalet — varken mer eller mindre.
- Lägg ALDRIG till datum, leveranslöften, funktioner eller slutsatser som inte finns i originalet.
- Bevara produktnamn och tekniska begrepp (t.ex. Eneo, API, SSO, SCIM, RAG, GitHub) när en översättning skulle ändra betydelsen.
- Titeln ska vara kort. Sammanfattningen ska vara två till tre beskrivande meningar.
- Om ingen sammanfattning skickas med: översätt endast titeln.

Svara enbart med JSON enligt det angivna schemat.`;

const SCHEMA_FULL = {
    type: 'object',
    properties: {
        title: { type: 'string' },
        summary: { type: 'string' },
    },
    required: ['title', 'summary'],
    additionalProperties: false,
};

const SCHEMA_TITLE_ONLY = {
    type: 'object',
    properties: {
        title: { type: 'string' },
    },
    required: ['title'],
    additionalProperties: false,
};

/**
 * Skapa den riktiga Anthropic-anroparen. SDK:t importeras lazy så att tester
 * och validering fungerar utan node_modules/API-nyckel.
 */
export function createAnthropicCaller() {
    let client = null;

    return async function callModel({ title, summary }) {
        if (client === null) {
            const { default: Anthropic } = await import('@anthropic-ai/sdk');
            client = new Anthropic(); // ANTHROPIC_API_KEY från miljön
        }

        const hasSummary = summary !== null;
        const response = await client.messages.create({
            model: 'claude-opus-4-8',
            max_tokens: 2048,
            thinking: { type: 'adaptive' },
            system: SYSTEM_PROMPT,
            output_config: {
                format: {
                    type: 'json_schema',
                    schema: hasSummary ? SCHEMA_FULL : SCHEMA_TITLE_ONLY,
                },
            },
            // Endast title + summary skickas — aldrig hela item-objektet (handoff §5)
            messages: [{ role: 'user', content: JSON.stringify({ title, summary }) }],
        });

        if (response.stop_reason !== 'end_turn') {
            throw new TranslationError(`AI-anropet avslutades med stop_reason "${response.stop_reason}"`);
        }
        const text = response.content.find((block) => block.type === 'text')?.text;
        if (!text) {
            throw new TranslationError('AI-svaret innehöll ingen text');
        }
        return JSON.parse(text);
    };
}
