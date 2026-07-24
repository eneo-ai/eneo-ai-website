import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
    contentHash,
    translateItems,
    normalizeCache,
    serializeCache,
    TranslationError,
} from '../lib/translate.mjs';

const VALID = JSON.parse(readFileSync(new URL('./fixtures/valid.json', import.meta.url), 'utf8'));

/** Stub som räknar anrop och returnerar kannad svenska. */
function createStub(respond = null) {
    const calls = [];
    return {
        calls,
        callModel: async (input) => {
            calls.push(input);
            if (respond) return respond(input);
            return {
                title: `SV: ${input.title}`,
                ...(input.summary !== null ? { summary: `SV: ${input.summary}` } : {}),
            };
        },
    };
}

function seededCache(items) {
    const entries = {};
    for (const item of items) {
        const summary = item.summary ?? '';
        entries[String(item.number)] = {
            hash: contentHash(item.title, summary),
            title: `Cachad: ${item.title}`,
            summary: summary === '' ? '' : `Cachad: ${summary}`,
        };
    }
    return { cacheVersion: 1, entries };
}

test('contentHash bygger på title + NUL + summary', () => {
    assert.equal(contentHash('a', 'b'), contentHash('a', 'b'));
    assert.notEqual(contentHash('a', 'b'), contentHash('ab', ''));
    assert.notEqual(contentHash('a', 'b'), contentHash('a', 'c'));
    // Saknad summary normaliseras till tom sträng
    assert.equal(contentHash('a', null), contentHash('a', ''));
    assert.equal(contentHash('a', undefined), contentHash('a', ''));
});

test('cacheträff: oförändrad text ger inga AI-anrop och oförändrad cache', async () => {
    const cache = seededCache(VALID.items);
    const before = serializeCache(normalizeCache(cache));
    const stub = createStub();

    const result = await translateItems(VALID.items, normalizeCache(cache), stub.callModel);

    assert.equal(stub.calls.length, 0);
    assert.equal(result.apiCalls, 0);
    assert.equal(serializeCache(result.cache), before);
    assert.equal(result.translations.get(601).title, 'Cachad: New design system rollout');
});

test('cachemiss: ny item översätts och lagras med korrekt hash', async () => {
    const stub = createStub();
    const result = await translateItems(VALID.items, normalizeCache(null), stub.callModel);

    assert.equal(stub.calls.length, VALID.items.length);
    const entry = result.cache.entries['601'];
    assert.equal(entry.hash, contentHash(VALID.items[0].title, VALID.items[0].summary));
    assert.equal(entry.title, 'SV: New design system rollout');
});

test('ändrad titel eller summary ger ny översättning', async () => {
    const items = structuredClone(VALID.items);
    const cache = seededCache(items);
    items[0].title = 'Renamed epic';
    const stub = createStub();

    const result = await translateItems(items, normalizeCache(cache), stub.callModel);

    assert.equal(stub.calls.length, 1);
    assert.equal(stub.calls[0].title, 'Renamed epic');
    assert.equal(result.translations.get(602).title, 'Cachad: Operational announcements');
});

test('ändrad status/grupp/version med samma text ger fortsatt cacheträff', async () => {
    const items = structuredClone(VALID.items);
    const cache = seededCache(items);
    items[0].status = 'Blocked';
    items[0].group = 'next';
    items[0].roadmapVersion = '9.9.9';
    const stub = createStub();

    const result = await translateItems(items, normalizeCache(cache), stub.callModel);

    assert.equal(stub.calls.length, 0);
    assert.equal(result.apiCalls, 0);
});

test('saknad summary: title-only-anrop, summary null, varning', async () => {
    const stub = createStub();
    const result = await translateItems(VALID.items, normalizeCache(null), stub.callModel);

    const call = stub.calls.find((c) => c.title === 'Agent builder');
    assert.equal(call.summary, null);
    assert.equal(result.translations.get(603).summary, null);
    assert.equal(result.cache.entries['603'].summary, '');
    assert.ok(result.warnings.some((w) => w.includes('#603')));
});

test('poster för försvunna issues rensas ur cachen', async () => {
    const cache = seededCache(VALID.items);
    cache.entries['999'] = { hash: 'x', title: 'Borta', summary: '' };

    const result = await translateItems(VALID.items, normalizeCache(cache), createStub().callModel);

    assert.equal(result.cache.entries['999'], undefined);
});

test('ogiltigt AI-svar fäller hela körningen', async () => {
    const emptyTitle = createStub(() => ({ title: '', summary: 'x' }));
    await assert.rejects(
        translateItems(VALID.items, normalizeCache(null), emptyTitle.callModel),
        TranslationError,
    );

    const missingSummary = createStub((input) => ({ title: `SV: ${input.title}` }));
    await assert.rejects(
        translateItems(VALID.items, normalizeCache(null), missingSummary.callModel),
        TranslationError,
    );
});

test('korrupt cache avvisas i stället för att tyst kastas', () => {
    assert.throws(() => normalizeCache({ nåt: 'annat' }), TranslationError);
    assert.throws(() => normalizeCache({ cacheVersion: 2, entries: {} }), TranslationError);
});

test('serializeCache är deterministisk med numeriskt sorterade nycklar', () => {
    const a = serializeCache({ cacheVersion: 1, entries: {
        10: { hash: 'h', title: 't', summary: 's' },
        2: { hash: 'h', title: 't', summary: 's' },
    } });
    const b = serializeCache({ cacheVersion: 1, entries: {
        2: { hash: 'h', title: 't', summary: 's' },
        10: { hash: 'h', title: 't', summary: 's' },
    } });
    assert.equal(a, b);
    assert.ok(a.indexOf('"2"') < a.indexOf('"10"'));
    assert.ok(a.endsWith('\n'));
});
