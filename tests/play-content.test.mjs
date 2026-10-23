import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { playSchema } from '../src/lib/play.ts';
const source = JSON.parse(readFileSync(new URL('../src/data/play.json', import.meta.url), 'utf8'));

test('Play copy, prompts, colors and reactions can be edited in one content source', () => {
  const edited = structuredClone(source);
  edited.headline = 'A small creative break';
  edited.prompts.push('Draw a tiny moon with a garden.');
  edited.pocket.messages[0] = 'A tiny visitor returns.';
  edited.palette.push({ name: 'Plum', value: '#663355' });
  edited.reactions.push({ effect: 'duck', message: 'A new visitor.', caption: 'Welcome back.' });
  const parsed = playSchema.parse(edited);
  assert.equal(parsed.headline, edited.headline);
  assert.equal(parsed.pocket.messages[0], edited.pocket.messages[0]);
  assert.equal(parsed.prompts.at(-1), edited.prompts.at(-1));
  assert.equal(parsed.palette.at(-1).value, '#663355');
  assert.equal(parsed.reactions.at(-1).message, 'A new visitor.');
});
test('invalid Play edits are rejected before publishing broken activities', () => {
  for (const field of ['palette', 'prompts', 'reactions']) assert.equal(playSchema.safeParse({ ...source, [field]: [] }).success, false, field);
  assert.equal(playSchema.safeParse({ ...source, pocket: { ...source.pocket, messages: ['Only one'] } }).success, false);
  const duplicate = structuredClone(source); duplicate.activities[1].id = duplicate.activities[0].id;
  assert.equal(playSchema.safeParse(duplicate).success, false);
  const unsupported = structuredClone(source); unsupported.reactions[0].effect = 'rewrite-the-website';
  assert.equal(playSchema.safeParse(unsupported).success, false);
  assert.equal(playSchema.safeParse({ ...source, palette: [{ name: 'Broken color', value: 'blue-ish' }] }).success, false);
});
