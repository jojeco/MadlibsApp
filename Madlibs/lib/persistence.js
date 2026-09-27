// lib/persistence.js
// Pure save/restore logic for the in-progress game and the finished-story
// history -- no React, no react-native, and no imports of any kind. Kept
// dependency-free so scripts/check-persistence.mjs can load it directly as
// a data: URL module in plain Node, without a bundler.
//
// Anything this module needs from a template (the blanks list, a template
// lookup function) is passed in as an argument rather than imported, so it
// stays testable in isolation.

export const GAME_KEY = 'madlibs:game:v1';
export const HISTORY_KEY = 'madlibs:history:v1';
export const SNAPSHOT_VERSION = 1;
export const HISTORY_LIMIT = 10;

/** Deterministic-when-injected id for a fresh game. */
export function newGameId(now = Date.now, rng = Math.random) {
    return now().toString(36) + '-' + Math.floor(rng() * 1e6).toString(36);
}

/**
 * Keep only answers for keys that exist on the template, trimmed and
 * within the same 1-30 character window as `validateWord` in lib/story.js.
 * Anything else (unknown key, non-string, empty/whitespace, too long) is
 * dropped. Bad input of any kind returns {}.
 */
export function sanitizeAnswers(template, answers) {
    if (!template || !Array.isArray(template.blanks) || !answers || typeof answers !== 'object') {
        return {};
    }
    const result = {};
    for (const blank of template.blanks) {
        const raw = answers[blank.key];
        if (typeof raw !== 'string') continue;
        const value = raw.trim();
        if (value.length < 1 || value.length > 30) continue;
        result[blank.key] = value;
    }
    return result;
}

/** Serialize an in-progress game snapshot for storage. */
export function serializeGame({ gameId, templateId, answers }) {
    return JSON.stringify({ v: SNAPSHOT_VERSION, gameId, templateId, answers });
}

/**
 * Parse a stored game snapshot. Never throws -- returns null for anything
 * that doesn't look like a valid snapshot for a template that still exists.
 */
export function parseGame(raw, getTemplate) {
    if (raw == null || typeof raw !== 'string') return null;

    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch (e) {
        return null;
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    if (parsed.v !== SNAPSHOT_VERSION) return null;
    if (typeof parsed.templateId !== 'string') return null;

    const template = getTemplate(parsed.templateId);
    if (!template) return null;

    const gameId = typeof parsed.gameId === 'string' ? parsed.gameId : newGameId();
    const answers = sanitizeAnswers(template, parsed.answers);

    return { gameId, templateId: parsed.templateId, answers };
}

/** Count of blanks with a non-empty trimmed answer. */
export function answeredCount(template, answers) {
    if (!template || !Array.isArray(template.blanks)) return 0;
    const safe = answers || {};
    return template.blanks.reduce((count, blank) => {
        const value = safe[blank.key];
        return typeof value === 'string' && value.trim().length > 0 ? count + 1 : count;
    }, 0);
}

/**
 * Where a "Continue" tap should take the player: null when there's nothing
 * to continue (bad template or zero answers), `{ kind: 'result' }` when
 * every blank is filled, otherwise the first unanswered blank's index.
 */
export function continueTarget(template, answers) {
    if (!template || !Array.isArray(template.blanks) || template.blanks.length === 0) return null;
    const safe = answers || {};
    if (answeredCount(template, safe) === 0) return null;

    for (let i = 0; i < template.blanks.length; i += 1) {
        const value = safe[template.blanks[i].key];
        if (!(typeof value === 'string' && value.trim().length > 0)) {
            return { kind: 'blank', index: i };
        }
    }
    return { kind: 'result' };
}

/** Turn a continueTarget() result into a route href, or null. */
export function continueHref(templateId, target) {
    if (!target) return null;
    if (target.kind === 'result') return '/page2';
    if (target.kind === 'blank') return `/play/${templateId}?resume=1&blank=${target.index}`;
    return null;
}

/** Build a finished-story history entry. */
export function makeHistoryEntry({ gameId, templateId, title, text, now = Date.now }) {
    return { gameId, templateId, title, text, completedAt: now() };
}

/**
 * Pure history update: drop any existing entry with the same gameId, put
 * the new entry first, and cap the result at `limit`. Bad history input is
 * treated as an empty list.
 */
export function addToHistory(history, entry, limit = HISTORY_LIMIT) {
    const safe = Array.isArray(history) ? history : [];
    const filtered = safe.filter((item) => !(item && item.gameId === entry.gameId));
    return [entry, ...filtered].slice(0, limit);
}

/** Serialize the history list for storage. */
export function serializeHistory(list) {
    return JSON.stringify(Array.isArray(list) ? list : []);
}

/**
 * Parse a stored history list. Never throws -- corrupt JSON, non-array
 * JSON, or individually malformed entries are dropped rather than
 * propagated, and the result is capped at HISTORY_LIMIT.
 */
export function parseHistory(raw) {
    if (raw == null || typeof raw !== 'string') return [];

    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch (e) {
        return [];
    }

    if (!Array.isArray(parsed)) return [];

    const valid = parsed.filter((item) => {
        return (
            item &&
            typeof item === 'object' &&
            typeof item.gameId === 'string' &&
            typeof item.templateId === 'string' &&
            typeof item.title === 'string' &&
            typeof item.text === 'string' &&
            typeof item.completedAt === 'number' &&
            Number.isFinite(item.completedAt)
        );
    });

    return valid.slice(0, HISTORY_LIMIT);
}

/**
 * Wrap an AsyncStorage-shaped backend ({ getItem, setItem, removeItem },
 * all promise-returning) with the save/load logic above. Every write goes
 * through a single queue so writes settle in call order and a rejected
 * write never propagates to the caller; reads independently fall back to
 * null/[] on any failure.
 */
export function createGameStore(backend) {
    let queue = Promise.resolve();

    function enqueueWrite(op) {
        queue = queue.then(() => op()).catch(() => {});
        return queue;
    }

    function loadGame(getTemplate) {
        return Promise.resolve()
            .then(() => backend.getItem(GAME_KEY))
            .then((raw) => parseGame(raw, getTemplate))
            .catch(() => null);
    }

    function saveGame(snapshot) {
        return enqueueWrite(() => backend.setItem(GAME_KEY, serializeGame(snapshot)));
    }

    function clearGame() {
        return enqueueWrite(() => backend.removeItem(GAME_KEY));
    }

    function loadHistory() {
        return Promise.resolve()
            .then(() => backend.getItem(HISTORY_KEY))
            .then((raw) => parseHistory(raw))
            .catch(() => []);
    }

    function saveHistory(list) {
        return enqueueWrite(() => backend.setItem(HISTORY_KEY, serializeHistory(list)));
    }

    return { loadGame, saveGame, clearGame, loadHistory, saveHistory };
}
