// lib/story.js
// Pure Mad Libs game logic -- no React, no react-native imports.
// Kept dependency-free so it can be parsed and executed standalone
// (see NEXT.md history / verification notes for why this matters).

import TEMPLATES from '../data/templates';

/** Find a template by id. Returns undefined if not found. */
export function getTemplate(id) {
    return TEMPLATES.find((template) => template.id === id);
}

/** Number of blanks a template has. */
export function blankCount(template) {
    if (!template || !Array.isArray(template.blanks)) return 0;
    return template.blanks.length;
}

/**
 * Validate a raw word entered by the player.
 * Trims whitespace; rejects empty/whitespace-only input and anything
 * longer than 30 characters (after trimming).
 */
export function validateWord(raw) {
    const value = (raw == null ? '' : String(raw)).trim();

    if (value.length === 0) {
        return { ok: false, value: '', error: 'Please enter a word' };
    }
    if (value.length > 30) {
        return { ok: false, value, error: 'Keep it under 30 characters' };
    }
    return { ok: true, value, error: null };
}

/** True when every blank in the template has a non-empty answer. */
export function isComplete(template, answers) {
    if (!template || !Array.isArray(template.blanks)) return false;
    const safeAnswers = answers || {};
    return template.blanks.every((blank) => {
        const value = safeAnswers[blank.key];
        return typeof value === 'string' && value.trim().length > 0;
    });
}

/**
 * Build the story as an ordered list of segments:
 * { text: string, isBlank: boolean }
 * Missing answers fall back to '___' rather than throwing, so this is
 * safe to call with a partially-filled-in answers object (e.g. while the
 * wizard is still mid-flow).
 */
export function buildStory(template, answers) {
    if (!template || !Array.isArray(template.parts)) return [];
    const safeAnswers = answers || {};

    return template.parts.map((part) => {
        if (typeof part === 'string') {
            return { text: part, isBlank: false };
        }
        const value = safeAnswers[part.blank];
        const text = typeof value === 'string' && value.trim().length > 0 ? value : '___';
        return { text, isBlank: true };
    });
}

/** Flatten story segments into a single plain string. */
export function storyToText(segments) {
    if (!Array.isArray(segments)) return '';
    return segments.map((segment) => segment.text).join('');
}

/**
 * Index of the blank with the given key, or 0 when the key isn't found or
 * the template is invalid (never -1, so it's always safe to use as a wizard
 * position).
 */
export function blankIndexForKey(template, key) {
    if (!template || !Array.isArray(template.blanks)) return 0;
    const i = template.blanks.findIndex((blank) => blank.key === key);
    return i < 0 ? 0 : i;
}

/**
 * Plain-text version of the finished story for sharing: the title, a blank
 * line, then the story body. Returns '' when there is no template.
 */
export function buildShareText(template, answers) {
    if (!template) return '';
    return `${template.title}\n\n${storyToText(buildStory(template, answers))}`;
}

/**
 * Pick a random template id, optionally excluding one (so "surprise me"
 * twice in a row doesn't hand back the story you just played).
 * `rng` must return a float in [0, 1) -- injected so this is testable.
 * Returns null when there is nothing to pick from.
 */
export function pickRandomTemplateId(templates, excludeId = null, rng = Math.random) {
    if (!Array.isArray(templates) || templates.length === 0) return null;

    const pool = templates.filter((t) => t && t.id !== excludeId);
    const source = pool.length === 0 ? templates : pool;

    const i = Math.min(Math.floor(rng() * source.length), source.length - 1);
    return source[i].id;
}
