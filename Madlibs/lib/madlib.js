// madlib.js
// Pure, dependency-free Mad Libs logic. No React/RN imports so this can be
// unit-tested with plain Node.

import templates from '../data/templates.js';

const PLACEHOLDER = '___';

/**
 * Look up a template by its `id`.
 * @param {string} id
 * @returns {object|undefined} the matching template, or undefined if not found
 */
export function getTemplateById(id) {
    return templates.find((template) => template.id === id);
}

/**
 * Return the list of blanks for a given template.
 * @param {object} template
 * @returns {Array<{key: string, label: string}>}
 */
export function getBlanks(template) {
    if (!template || !Array.isArray(template.blanks)) {
        return [];
    }
    return template.blanks;
}

/**
 * Substitute every `{key}` placeholder in `template.text` with the matching
 * value from `answers`. Missing or blank answers fall back to a visible
 * placeholder (`___`) so the result never silently drops a blank.
 * @param {object} template
 * @param {Record<string, string>} answers
 * @returns {string} the completed story, or an empty string if template is invalid
 */
export function fillTemplate(template, answers = {}) {
    if (!template || typeof template.text !== 'string') {
        return '';
    }

    return template.text.replace(/{(\w+)}/g, (match, key) => {
        const value = answers[key];
        if (typeof value === 'string' && value.trim().length > 0) {
            return value.trim();
        }
        return PLACEHOLDER;
    });
}

export { PLACEHOLDER };
