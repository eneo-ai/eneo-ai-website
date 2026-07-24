import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateRoadmap, RoadmapValidationError } from '../lib/validate.mjs';

const VALID = JSON.parse(readFileSync(new URL('./fixtures/valid.json', import.meta.url), 'utf8'));

/** Klona giltig fixture och applicera en mutation. */
function mutated(mutate) {
    const copy = structuredClone(VALID);
    mutate(copy);
    return copy;
}

function assertRejects(data, messagePart) {
    assert.throws(
        () => validateRoadmap(data),
        (error) => error instanceof RoadmapValidationError && error.message.includes(messagePart),
        `förväntade valideringsfel som nämner "${messagePart}"`,
    );
}

test('giltig schema 1-export accepteras', () => {
    assert.doesNotThrow(() => validateRoadmap(VALID));
});

test('okänd schemaVersion avvisas', () => {
    assertRejects(mutated((d) => { d.schemaVersion = 2; }), 'schemaVersion');
    assertRejects(mutated((d) => { d.schemaVersion = '1'; }), 'schemaVersion');
});

test('saknad schemaVersion avvisas', () => {
    assertRejects(mutated((d) => { delete d.schemaVersion; }), 'schemaVersion');
});

test('avvikande source avvisas', () => {
    assertRejects(mutated((d) => { d.source.owner = 'annan-org'; }), 'source.owner');
    assertRejects(mutated((d) => { d.source.project = 6; }), 'source.project');
    assertRejects(mutated((d) => { d.source.repository = 'eneo-ai/annat'; }), 'source.repository');
});

test('fel groups-ordning eller -innehåll avvisas', () => {
    assertRejects(mutated((d) => { d.groups = ['next', 'in_progress', 'later', 'delivered']; }), 'groups');
    assertRejects(mutated((d) => { d.groups.push('extra'); }), 'groups');
    assertRejects(mutated((d) => { d.groups = d.groups.slice(0, 3); }), 'groups');
});

test('ogiltigt unpublishedItemCount avvisas', () => {
    assertRejects(mutated((d) => { d.unpublishedItemCount = -1; }), 'unpublishedItemCount');
    assertRejects(mutated((d) => { d.unpublishedItemCount = '2'; }), 'unpublishedItemCount');
    assertRejects(mutated((d) => { d.unpublishedItemCount = null; }), 'unpublishedItemCount');
});

test('items som inte är en lista avvisas', () => {
    assertRejects(mutated((d) => { d.items = {}; }), 'items');
});

test('item utan obligatoriskt fält avvisas', () => {
    assertRejects(mutated((d) => { delete d.items[0].title; }), 'title');
    assertRejects(mutated((d) => { delete d.items[1].status; }), 'status');
    assertRejects(mutated((d) => { d.items[2].url = null; }), 'url');
});

test('group utanför kontraktet avvisas', () => {
    assertRejects(mutated((d) => { d.items[0].group = 'exploring'; }), 'group');
});

test('url utanför eneo-ai/eneo avvisas', () => {
    assertRejects(
        mutated((d) => { d.items[0].url = 'https://github.com/annan-org/eneo/issues/601'; }),
        'url',
    );
    assertRejects(
        mutated((d) => { d.items[0].url = 'https://github.com/eneo-ai/eneo/pull/601'; }),
        'url',
    );
});

test('url vars nummer inte matchar item.number avvisas', () => {
    assertRejects(
        mutated((d) => { d.items[0].url = 'https://github.com/eneo-ai/eneo/issues/999'; }),
        'matchar inte',
    );
});

test('dubblett av issue-nummer avvisas', () => {
    assertRejects(mutated((d) => {
        d.items[1].number = d.items[0].number;
        d.items[1].url = d.items[0].url;
    }), 'dubblett');
});

test('ogiltigt generatedAt avvisas', () => {
    assertRejects(mutated((d) => { d.generatedAt = 'inte-ett-datum'; }), 'generatedAt');
});

test('valfria fält med fel typ avvisas', () => {
    assertRejects(mutated((d) => { d.items[0].area = 42; }), 'area');
});
