// madlib.test.js
import test from 'node:test';
import assert from 'node:assert/strict';

import { getTemplateById, getBlanks, fillTemplate, PLACEHOLDER } from '../lib/madlib.js';

test('getTemplateById returns the matching template', () => {
    const template = getTemplateById('backyard-adventure');
    assert.ok(template);
    assert.equal(template.id, 'backyard-adventure');
});

test('getTemplateById returns undefined for an unknown id', () => {
    const template = getTemplateById('does-not-exist');
    assert.equal(template, undefined);
});

test('getBlanks returns the blanks array for a template', () => {
    const template = getTemplateById('backyard-adventure');
    const blanks = getBlanks(template);
    assert.equal(blanks.length, 4);
    assert.deepEqual(
        blanks.map((b) => b.key),
        ['adjective', 'noun', 'verb', 'place']
    );
});

test('getBlanks returns an empty array for an invalid template', () => {
    assert.deepEqual(getBlanks(undefined), []);
    assert.deepEqual(getBlanks({}), []);
});

test('fillTemplate substitutes every placeholder when all answers are supplied', () => {
    const template = getTemplateById('backyard-adventure');
    const story = fillTemplate(template, {
        adjective: 'silly',
        noun: 'dog',
        verb: 'jumped',
        place: 'garden',
    });
    assert.equal(story, 'The silly dog jumped over the fence and landed in the garden.');
    assert.equal(/{[^}]*}/.test(story), false);
});

test('fillTemplate falls back to a visible placeholder for missing or blank answers', () => {
    const template = getTemplateById('backyard-adventure');
    const story = fillTemplate(template, { adjective: 'silly', noun: '   ' });
    assert.equal(story, `The silly ${PLACEHOLDER} ${PLACEHOLDER} over the fence and landed in the ${PLACEHOLDER}.`);
});

test('fillTemplate returns an empty string for an unknown/undefined template', () => {
    assert.equal(fillTemplate(undefined, {}), '');
    assert.equal(fillTemplate(getTemplateById('nope'), {}), '');
});
