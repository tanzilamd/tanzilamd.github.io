import { z } from 'astro/zod';
import source from '../data/play.json' with { type: 'json' };
import { playKeys } from './play-routes.ts';

// Validate the owner's single editable source during the build, not in game loops.
const text = z.string().trim().min(1);
export const playSchema = z.object({
  headline: text, headlineAccent: text, intro: text,
  pocket: z.object({ label: text }),
  activities: z.array(z.object({
    id: z.enum(playKeys), number: text,
    label: text, title: text, description: text, action: text,
    group: z.enum(['game', 'creative']),
  })).length(playKeys.length).refine((items) => new Set(items.map((item) => item.id)).size === playKeys.length, 'Keep one card for each activity.'),
  palette: z.array(z.object({ name: text, value: z.string().regex(/^#[0-9a-f]{6}$/i, 'Use a six-digit hex color.') })).min(1),
  prompts: z.array(text).min(1),
  reactions: z.array(z.object({ effect: z.enum(['balloon', 'flip', 'confetti', 'duck', 'bubbles']), message: text, caption: text })).min(1),
  zone: z.object({
    daily: z.array(z.object({ game: z.enum(['snake', 'dino-run', 'aim-trainer']), target: z.number().int().min(1).max(100), accuracy: z.number().int().min(0).max(100) })).length(3).refine(items => new Set(items.map(item => item.game)).size === 3, 'Keep one daily challenge per new game.'),
    achievements: z.array(z.object({ id: z.enum(['first', 'snake', 'dino', 'aim', 'tower', 'draw', 'daily', 'explorer']), title: text, description: text })).length(8).refine(items => new Set(items.map(item => item.id)).size === 8, 'Keep each achievement once.'),
  }),
});
export default playSchema.parse(source);
