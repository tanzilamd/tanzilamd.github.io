import { z } from 'astro/zod';
import source from '../data/play.json' with { type: 'json' };

// Validate the owner's single editable source during the build, not in game loops.
const text = z.string().trim().min(1);
export const playSchema = z.object({
  headline: text, headlineAccent: text, intro: text,
  activities: z.array(z.object({
    id: z.enum(['playground', 'draw', 'button']), number: text,
    label: text, title: text, description: text, action: text,
  })).length(3).refine((items) => new Set(items.map((item) => item.id)).size === 3, 'Keep one card for each activity.'),
  palette: z.array(z.object({ name: text, value: z.string().regex(/^#[0-9a-f]{6}$/i, 'Use a six-digit hex color.') })).min(1),
  prompts: z.array(text).min(1),
  reactions: z.array(z.object({ effect: z.enum(['balloon', 'flip', 'confetti', 'duck']), message: text, caption: text })).min(1),
});
export default playSchema.parse(source);
