/**
 * Strikt validering av källexporten (eneo-roadmap-public-json, schemaVersion 1).
 * Reglerna speglar ROADMAP_WEBSITE_HANDOFF.md §4 — vid minsta avvikelse ska
 * körningen stoppas utan att något skrivs eller committas.
 */

export class RoadmapValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'RoadmapValidationError';
    }
}

const EXPECTED_SCHEMA_VERSION = 1;
// project är strängen "5" i exporten (verifierat mot verklig artifakt 2026-07-24)
const EXPECTED_SOURCE = { owner: 'eneo-ai', project: '5', repository: 'eneo-ai/eneo' };
const EXPECTED_GROUPS = ['in_progress', 'next', 'later', 'delivered'];
const ISSUE_URL_PATTERN = /^https:\/\/github\.com\/eneo-ai\/eneo\/issues\/(\d+)$/;

// Fält som måste finnas med giltigt värde på varje item
const REQUIRED_ITEM_FIELDS = ['number', 'url', 'title', 'status', 'group'];
// Fält som får saknas/vara null, men måste vara sträng om de har värde
const OPTIONAL_STRING_FIELDS = ['summary', 'roadmapVersion', 'area', 'priority', 'startDate', 'targetDate'];

function fail(message) {
    throw new RoadmapValidationError(message);
}

/**
 * Validera hela exporten. Kastar RoadmapValidationError vid första avvikelsen.
 * @param {unknown} data - Parsad JSON från källexporten
 */
export function validateRoadmap(data) {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        fail('Roten är inte ett objekt');
    }

    // schemaVersion — exakt 1, okända versioner avvisas
    if (data.schemaVersion !== EXPECTED_SCHEMA_VERSION) {
        fail(`schemaVersion är ${JSON.stringify(data.schemaVersion)}, förväntade exakt ${EXPECTED_SCHEMA_VERSION}`);
    }

    // source — exakta värden
    const source = data.source;
    if (typeof source !== 'object' || source === null) {
        fail('source saknas eller är inte ett objekt');
    }
    for (const [key, expected] of Object.entries(EXPECTED_SOURCE)) {
        if (source[key] !== expected) {
            fail(`source.${key} är ${JSON.stringify(source[key])}, förväntade ${JSON.stringify(expected)}`);
        }
    }

    // generatedAt — giltigt datum
    if (typeof data.generatedAt !== 'string' || Number.isNaN(Date.parse(data.generatedAt))) {
        fail(`generatedAt är inte ett giltigt datum: ${JSON.stringify(data.generatedAt)}`);
    }

    // groups — exakt lista i exakt ordning
    const groups = data.groups;
    if (!Array.isArray(groups) || groups.length !== EXPECTED_GROUPS.length
        || !EXPECTED_GROUPS.every((g, i) => groups[i] === g)) {
        fail(`groups är ${JSON.stringify(groups)}, förväntade exakt ${JSON.stringify(EXPECTED_GROUPS)}`);
    }

    // unpublishedItemCount — heltal >= 0
    if (!Number.isInteger(data.unpublishedItemCount) || data.unpublishedItemCount < 0) {
        fail(`unpublishedItemCount är inte ett heltal >= 0: ${JSON.stringify(data.unpublishedItemCount)}`);
    }

    // items — lista
    if (!Array.isArray(data.items)) {
        fail('items är inte en lista');
    }

    const seenNumbers = new Set();
    for (const [index, item] of data.items.entries()) {
        validateItem(item, index, seenNumbers);
    }
}

function validateItem(item, index, seenNumbers) {
    const label = () => `items[${index}]${Number.isInteger(item?.number) ? ` (#${item.number})` : ''}`;

    if (typeof item !== 'object' || item === null) {
        fail(`${label()} är inte ett objekt`);
    }

    for (const field of REQUIRED_ITEM_FIELDS) {
        if (item[field] === undefined || item[field] === null) {
            fail(`${label()} saknar obligatoriskt fält "${field}"`);
        }
    }

    if (!Number.isInteger(item.number) || item.number < 1) {
        fail(`${label()}: number är inte ett positivt heltal`);
    }
    if (seenNumbers.has(item.number)) {
        fail(`${label()}: dubblett av issue-nummer ${item.number}`);
    }
    seenNumbers.add(item.number);

    if (typeof item.title !== 'string' || item.title.trim() === '') {
        fail(`${label()}: title är inte en icke-tom sträng`);
    }
    if (typeof item.status !== 'string' || item.status.trim() === '') {
        fail(`${label()}: status är inte en icke-tom sträng`);
    }

    if (!EXPECTED_GROUPS.includes(item.group)) {
        fail(`${label()}: group ${JSON.stringify(item.group)} ligger utanför kontraktet`);
    }

    // url — publikt issue i eneo-ai/eneo, och numret i url:en måste matcha item.number
    if (typeof item.url !== 'string') {
        fail(`${label()}: url är inte en sträng`);
    }
    const urlMatch = ISSUE_URL_PATTERN.exec(item.url);
    if (!urlMatch) {
        fail(`${label()}: url pekar inte på ett issue i https://github.com/eneo-ai/eneo/: ${JSON.stringify(item.url)}`);
    }
    if (Number(urlMatch[1]) !== item.number) {
        fail(`${label()}: url-numret (${urlMatch[1]}) matchar inte number (${item.number})`);
    }

    for (const field of OPTIONAL_STRING_FIELDS) {
        const value = item[field];
        if (value !== undefined && value !== null && typeof value !== 'string') {
            fail(`${label()}: ${field} måste vara en sträng eller null`);
        }
    }
}
