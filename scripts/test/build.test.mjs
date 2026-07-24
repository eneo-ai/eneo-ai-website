import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { build } from '../build-roadmap.mjs';
import { RoadmapValidationError } from '../lib/validate.mjs';

const VALID = JSON.parse(readFileSync(new URL('./fixtures/valid.json', import.meta.url), 'utf8'));

const stubModel = async (input) => ({
    title: `SV: ${input.title}`,
    ...(input.summary !== null ? { summary: `SV: ${input.summary}` } : {}),
});

test('build: envelope kopieras ordagrant, titlar/sammanfattningar byts ut', async () => {
    const { output, warnings, apiCalls } = await build(VALID, null, stubModel);

    assert.equal(output.schemaVersion, 1);
    assert.equal(output.generatedAt, VALID.generatedAt);
    assert.deepEqual(output.source, VALID.source);
    assert.deepEqual(output.groups, VALID.groups);
    assert.equal(output.unpublishedItemCount, VALID.unpublishedItemCount);
    assert.equal(output.items.length, VALID.items.length);

    const first = output.items[0];
    assert.equal(first.title, 'SV: New design system rollout');
    assert.equal(first.summary, 'SV: Continue migrating the UI to shadcn-svelte for a consistent, accessible interface.');
    // Planeringsfält rörs inte av översättningen
    assert.equal(first.status, VALID.items[0].status);
    assert.equal(first.group, VALID.items[0].group);
    assert.equal(first.roadmapVersion, VALID.items[0].roadmapVersion);
    assert.equal(first.url, VALID.items[0].url);

    // Item utan summary publiceras med summary: null
    const noSummary = output.items.find((i) => i.number === 603);
    assert.equal(noSummary.summary, null);

    assert.equal(apiCalls, VALID.items.length);
    assert.equal(warnings.length, 1);
});

test('build: ogiltig källa kastar före några AI-anrop', async () => {
    const broken = structuredClone(VALID);
    broken.schemaVersion = 2;
    let called = false;

    await assert.rejects(
        build(broken, null, async () => { called = true; return { title: 'x' }; }),
        RoadmapValidationError,
    );
    assert.equal(called, false);
});

test('build: andra körningen med samma källa ger 0 AI-anrop och identisk cache', async () => {
    const first = await build(VALID, null, stubModel);
    const second = await build(VALID, JSON.parse(first.cacheText), async () => {
        throw new Error('skulle inte anropas');
    });

    assert.equal(second.apiCalls, 0);
    assert.equal(second.cacheText, first.cacheText);
    assert.deepEqual(second.output, first.output);
});
