#!/usr/bin/env node
// scripts/check-persistence.mjs
// Zero-dependency check for lib/persistence.js. Loads it (and the equally
// import-free data/templates.js) as data: URL modules so this can run in
// plain Node without jest/jest-expo or a bundler -- see NEXT.md for why
// those aren't wired up yet. Run with `npm run check` from Madlibs/.

import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const load = async (rel) =>
    import(
        'data:text/javascript;base64,' +
            Buffer.from(await readFile(new URL(rel, import.meta.url))).toString('base64')
    );

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        passed += 1;
    } catch (err) {
        failed += 1;
        console.error(`FAIL: ${name}`);
        console.error(err && err.message ? err.message : err);
    }
}

function makeFakeBackend() {
    const store = new Map();
    return {
        store,
        getItem: async (key) => (store.has(key) ? store.get(key) : null),
        setItem: async (key, value) => {
            store.set(key, value);
        },
        removeItem: async (key) => {
            store.delete(key);
        },
    };
}

async function main() {
    const persistence = await load('../lib/persistence.js');
    const templatesModule = await load('../data/templates.js');
    const TEMPLATES = templatesModule.default;

    const {
        SNAPSHOT_VERSION,
        HISTORY_LIMIT,
        newGameId,
        serializeGame,
        parseGame,
        answeredCount,
        continueTarget,
        continueHref,
        makeHistoryEntry,
        addToHistory,
        parseHistory,
        createGameStore,
    } = persistence;

    function getTemplate(id) {
        return TEMPLATES.find((t) => t.id === id);
    }

    const template = getTemplate('space-vacation'); // 6 blanks: b1..b6

    // -- parseGame --------------------------------------------------------
    test('parseGame: null/undefined/number return null', () => {
        assert.equal(parseGame(null, getTemplate), null);
        assert.equal(parseGame(undefined, getTemplate), null);
        assert.equal(parseGame(5, getTemplate), null);
    });

    test('parseGame: malformed JSON returns null', () => {
        assert.equal(parseGame('{not json', getTemplate), null);
    });

    test('parseGame: non-object JSON returns null', () => {
        assert.equal(parseGame('[]', getTemplate), null);
    });

    test('parseGame: wrong version returns null', () => {
        const raw = JSON.stringify({ v: 2, gameId: 'g1', templateId: 'space-vacation', answers: {} });
        assert.equal(parseGame(raw, getTemplate), null);
    });

    test('parseGame: unknown templateId returns null', () => {
        const raw = JSON.stringify({ v: SNAPSHOT_VERSION, gameId: 'g1', templateId: 'nope', answers: {} });
        assert.equal(parseGame(raw, getTemplate), null);
    });

    test('parseGame: valid round trip preserves answers', () => {
        const answers = { b1: 'Mars', b2: 'Rex' };
        const raw = serializeGame({ gameId: 'g1', templateId: 'space-vacation', answers });
        const result = parseGame(raw, getTemplate);
        assert.deepEqual(result.answers, answers);
        assert.equal(result.templateId, 'space-vacation');
        assert.equal(result.gameId, 'g1');
    });

    test('parseGame: junk answers are removed', () => {
        const raw = JSON.stringify({
            v: SNAPSHOT_VERSION,
            gameId: 'g1',
            templateId: 'space-vacation',
            answers: {
                bUnknown: 'nope',
                b1: 42,
                b2: '   ',
                b3: 'x'.repeat(31),
                b4: '  padded  ',
            },
        });
        const result = parseGame(raw, getTemplate);
        assert.deepEqual(result.answers, { b4: 'padded' });
    });

    test('parseGame: missing gameId gets a fresh id', () => {
        const raw = JSON.stringify({ v: SNAPSHOT_VERSION, templateId: 'space-vacation', answers: {} });
        const result = parseGame(raw, getTemplate);
        assert.equal(typeof result.gameId, 'string');
        assert.ok(result.gameId.length > 0);
    });

    // -- continueTarget / continueHref -------------------------------------
    test('continueTarget: zero answers returns null', () => {
        assert.equal(continueTarget(template, {}), null);
    });

    test('continueTarget: partial answers point to first unanswered index, including a gap', () => {
        assert.deepEqual(continueTarget(template, { b1: 'x', b3: 'y' }), { kind: 'blank', index: 1 });
    });

    test('continueTarget: full set gives result', () => {
        const answers = { b1: 'a', b2: 'b', b3: 'c', b4: 'd', b5: 'e', b6: 'f' };
        assert.deepEqual(continueTarget(template, answers), { kind: 'result' });
    });

    test('continueHref: result maps to /page2', () => {
        assert.equal(continueHref('space-vacation', { kind: 'result' }), '/page2');
    });

    test('continueHref: blank maps to exact wizard URL', () => {
        assert.equal(
            continueHref('space-vacation', { kind: 'blank', index: 2 }),
            '/play/space-vacation?resume=1&blank=2'
        );
    });

    test('continueHref: null target returns null', () => {
        assert.equal(continueHref('space-vacation', null), null);
    });

    // -- answeredCount --------------------------------------------------------
    test('answeredCount: counts non-empty answers on a partial set', () => {
        assert.equal(answeredCount(template, { b1: 'a', b2: '', b3: 'c' }), 2);
    });

    // -- makeHistoryEntry / addToHistory ---------------------------------------
    test('makeHistoryEntry: builds entry with injected now', () => {
        const entry = makeHistoryEntry({ gameId: 'g1', templateId: 't1', title: 'T', text: 'hi', now: () => 42 });
        assert.deepEqual(entry, { gameId: 'g1', templateId: 't1', title: 'T', text: 'hi', completedAt: 42 });
    });

    test('addToHistory: adding puts the entry first', () => {
        const existing = [{ gameId: 'old', templateId: 't', title: 'T', text: 'x', completedAt: 1 }];
        const entry = { gameId: 'new', templateId: 't', title: 'T2', text: 'y', completedAt: 2 };
        const result = addToHistory(existing, entry);
        assert.equal(result[0].gameId, 'new');
        assert.equal(result.length, 2);
    });

    test('addToHistory: duplicate gameId replaces and moves to front, no dupes', () => {
        const existing = [
            { gameId: 'a', templateId: 't', title: 'A', text: 'old', completedAt: 1 },
            { gameId: 'b', templateId: 't', title: 'B', text: 'x', completedAt: 2 },
        ];
        const entry = { gameId: 'a', templateId: 't', title: 'A', text: 'new', completedAt: 3 };
        const result = addToHistory(existing, entry);
        assert.equal(result.length, 2);
        assert.equal(result[0].text, 'new');
        assert.equal(result.filter((e) => e.gameId === 'a').length, 1);
    });

    test('addToHistory: cap is 10', () => {
        const existing = Array.from({ length: 10 }, (_, i) => ({
            gameId: `g${i}`,
            templateId: 't',
            title: 'T',
            text: 'x',
            completedAt: i,
        }));
        const entry = { gameId: 'new', templateId: 't', title: 'T', text: 'y', completedAt: 99 };
        const result = addToHistory(existing, entry);
        assert.equal(result.length, HISTORY_LIMIT);
        assert.equal(result[0].gameId, 'new');
    });

    test('addToHistory: bad input treated as []', () => {
        const entry = { gameId: 'a', templateId: 't', title: 'T', text: 'x', completedAt: 1 };
        assert.deepEqual(addToHistory(null, entry), [entry]);
        assert.deepEqual(addToHistory(undefined, entry), [entry]);
        assert.deepEqual(addToHistory('nope', entry), [entry]);
    });

    // -- parseHistory -----------------------------------------------------
    test('parseHistory: corrupt JSON gives []', () => {
        assert.deepEqual(parseHistory('{not json'), []);
    });

    test('parseHistory: non-array JSON gives []', () => {
        assert.deepEqual(parseHistory(JSON.stringify({ a: 1 })), []);
    });

    test('parseHistory: invalid entries are filtered out', () => {
        const raw = JSON.stringify([
            { gameId: 'a', templateId: 't', title: 'T', text: 'x', completedAt: 1 },
            { gameId: 'b', templateId: 't', title: 'T' },
            { gameId: 'c', templateId: 't', title: 'T', text: 'x', completedAt: 'nope' },
            null,
            'nope',
        ]);
        const result = parseHistory(raw);
        assert.equal(result.length, 1);
        assert.equal(result[0].gameId, 'a');
    });

    test('parseHistory: more than 10 entries are cut to 10', () => {
        const list = Array.from({ length: 15 }, (_, i) => ({
            gameId: `g${i}`,
            templateId: 't',
            title: 'T',
            text: 'x',
            completedAt: i,
        }));
        assert.equal(parseHistory(JSON.stringify(list)).length, HISTORY_LIMIT);
    });

    // -- createGameStore ----------------------------------------------------
    await (async () => {
        const backend = makeFakeBackend();
        const store = createGameStore(backend);
        await store.saveGame({ gameId: 'g1', templateId: 'space-vacation', answers: { b1: 'x' } });
        const loaded = await store.loadGame(getTemplate);
        test('createGameStore: saveGame then loadGame round trip', () => {
            assert.deepEqual(loaded, { gameId: 'g1', templateId: 'space-vacation', answers: { b1: 'x' } });
        });
    })();

    await (async () => {
        const backend = makeFakeBackend();
        const store = createGameStore(backend);
        await store.saveGame({ gameId: 'g1', templateId: 'space-vacation', answers: {} });
        await store.clearGame();
        const loaded = await store.loadGame(getTemplate);
        test('createGameStore: clearGame leads to loadGame returning null', () => {
            assert.equal(loaded, null);
        });
    })();

    await (async () => {
        const backend = {
            getItem: async () => {
                throw new Error('boom');
            },
            setItem: async () => {},
            removeItem: async () => {},
        };
        const store = createGameStore(backend);
        const game = await store.loadGame(getTemplate);
        const history = await store.loadHistory();
        test('createGameStore: getItem throwing/rejecting -> loadGame null, loadHistory []', () => {
            assert.equal(game, null);
            assert.deepEqual(history, []);
        });
    })();

    await (async () => {
        const backend = {
            getItem: async () => null,
            setItem: async () => {
                throw new Error('boom');
            },
            removeItem: async () => {},
        };
        const store = createGameStore(backend);
        let rejected = false;
        try {
            await store.saveGame({ gameId: 'g1', templateId: 'space-vacation', answers: {} });
        } catch (e) {
            rejected = true;
        }
        test('createGameStore: setItem rejecting does not reject the caller', () => {
            assert.equal(rejected, false);
        });
    })();

    await (async () => {
        const calls = [];
        const finalStore = new Map();
        const backend = {
            getItem: async (key) => (finalStore.has(key) ? finalStore.get(key) : null),
            setItem: (key, value) => {
                const delay = calls.length === 0 ? 30 : 1;
                calls.push(value);
                return new Promise((resolve) => {
                    setTimeout(() => {
                        finalStore.set(key, value);
                        resolve();
                    }, delay);
                });
            },
            removeItem: async (key) => {
                finalStore.delete(key);
            },
        };
        const store = createGameStore(backend);
        const p1 = store.saveGame({ gameId: 'g1', templateId: 'space-vacation', answers: { b1: 'first' } });
        const p2 = store.saveGame({ gameId: 'g1', templateId: 'space-vacation', answers: { b1: 'second' } });
        await Promise.all([p1, p2]);
        const loaded = await store.loadGame(getTemplate);
        test('createGameStore: write ordering keeps the second save', () => {
            assert.equal(loaded.answers.b1, 'second');
        });
    })();

    // -- newGameId ----------------------------------------------------------
    test('newGameId: deterministic with injected now/rng', () => {
        const now = () => 1000;
        const rng = () => 0.5;
        const id1 = newGameId(now, rng);
        const id2 = newGameId(now, rng);
        assert.equal(id1, id2);
        assert.equal(id1, (1000).toString(36) + '-' + Math.floor(0.5 * 1e6).toString(36));
    });

    console.log(`${passed} passed, ${failed} failed`);
    if (failed > 0) process.exitCode = 1;
}

main();
