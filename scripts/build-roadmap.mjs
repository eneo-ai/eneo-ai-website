#!/usr/bin/env node
/**
 * Bygg webbplatsens data/roadmap.json från källexporten i eneo-ai/eneo.
 *
 *   node scripts/build-roadmap.mjs <sökväg-till-källans-roadmap.json> [--check-only]
 *
 * Flöde (ROADMAP_WEBSITE_HANDOFF.md):
 *   1. Validera källan strikt (§4) — avvikelse => exit 1, inget skrivs.
 *   2. Översätt endast nya/ändrade titlar+sammanfattningar (§5), med cache.
 *   3. Skriv data/roadmap.json + data/roadmap-translations.json — först när
 *      allt lyckats (temp + rename).
 *
 * --check-only: stanna efter valideringen (inga AI-anrop, inget skrivs).
 */

import { readFileSync, writeFileSync, renameSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateRoadmap, RoadmapValidationError } from './lib/validate.mjs';
import {
    translateItems,
    createAnthropicCaller,
    normalizeCache,
    serializeCache,
    TranslationError,
} from './lib/translate.mjs';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = join(REPO_ROOT, 'data');
const OUTPUT_PATH = join(DATA_DIR, 'roadmap.json');
const CACHE_PATH = join(DATA_DIR, 'roadmap-translations.json');

function writeAtomic(path, content) {
    const tmp = `${path}.tmp`;
    writeFileSync(tmp, content, 'utf8');
    renameSync(tmp, path);
}

/**
 * Kärnan, exporterad för tester. callModel injiceras; paths kan pekas om.
 * @returns {Promise<{output: object, cacheText: string, warnings: string[], apiCalls: number}>}
 */
/** Ta bort ledande issue-tracker-prefix som "[Epic]: " från en titel. */
function stripTrackerPrefix(title) {
    return title.replace(/^\s*\[[^\]]+\]:\s*/, '');
}

export async function build(source, existingCacheRaw, callModel) {
    validateRoadmap(source);

    const cache = normalizeCache(existingCacheRaw);
    // Normalisera titlar före översättning (och därmed före hash/cache) så att
    // tracker-brus aldrig når vare sig AI:n eller den publicerade datan.
    const normalizedItems = source.items.map((item) => ({
        ...item,
        title: stripTrackerPrefix(item.title),
    }));
    const { translations, cache: newCache, warnings, apiCalls } =
        await translateItems(normalizedItems, cache, callModel);

    const output = {
        schemaVersion: source.schemaVersion,
        generatedAt: source.generatedAt,
        source: source.source,
        groups: source.groups,
        unpublishedItemCount: source.unpublishedItemCount,
        items: source.items.map((item) => {
            const translated = translations.get(item.number);
            return {
                number: item.number,
                url: item.url,
                title: translated.title,
                summary: translated.summary,
                status: item.status,
                roadmapVersion: item.roadmapVersion ?? null,
                area: item.area ?? null,
                priority: item.priority ?? null,
                startDate: item.startDate ?? null,
                targetDate: item.targetDate ?? null,
                group: item.group,
            };
        }),
    };

    return { output, cacheText: serializeCache(newCache), warnings, apiCalls };
}

async function main() {
    const args = process.argv.slice(2);
    const checkOnly = args.includes('--check-only');
    const sourcePath = args.find((a) => !a.startsWith('--'));

    if (!sourcePath) {
        console.error('Användning: node scripts/build-roadmap.mjs <källfil> [--check-only]');
        process.exit(1);
    }

    let source;
    try {
        source = JSON.parse(readFileSync(sourcePath, 'utf8'));
    } catch (error) {
        console.error(`::error::Kunde inte läsa/parsa källfilen: ${error.message}`);
        process.exit(1);
    }

    try {
        if (checkOnly) {
            validateRoadmap(source);
            console.log(`OK: ${sourcePath} följer schema 1 (${source.items.length} items).`);
            return;
        }

        let existingCacheRaw = null;
        let existingCacheText = null;
        if (existsSync(CACHE_PATH)) {
            existingCacheText = readFileSync(CACHE_PATH, 'utf8');
            existingCacheRaw = JSON.parse(existingCacheText); // korrupt cache => fel, hellre än att tyst kasta den
        }

        const { output, cacheText, warnings, apiCalls } =
            await build(source, existingCacheRaw, createAnthropicCaller());

        for (const warning of warnings) {
            console.log(`::warning::${warning}`);
        }

        mkdirSync(DATA_DIR, { recursive: true });
        writeAtomic(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
        if (cacheText !== existingCacheText) {
            writeAtomic(CACHE_PATH, cacheText);
        }

        console.log(`Klart: ${output.items.length} items, ${apiCalls} AI-anrop, `
            + `${output.items.length - apiCalls} cacheträffar.`);
    } catch (error) {
        if (error instanceof RoadmapValidationError) {
            console.error(`::error::Valideringsfel: ${error.message}`);
        } else if (error instanceof TranslationError) {
            console.error(`::error::Översättningsfel: ${error.message}`);
        } else {
            console.error(`::error::${error.message}`);
        }
        process.exit(1);
    }
}

// Kör bara main när filen exekveras direkt (inte vid import i tester)
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
    await main();
}
