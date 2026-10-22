import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const common = { draft: z.boolean().default(false), order: z.number().default(99) };
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    ...common, title: z.string(), summary: z.string(), category: z.enum(['Product', 'Tool', 'Experiment', 'Earlier work']),
    role: z.string(), period: z.string().optional(), featured: z.boolean().default(false),
    status: z.string(), cover: z.enum(['tuktak', 'scopeproof', 'engjatra', 'choreseed', 'cargotab', 'tanzilbot', 'custom']).default('custom'),
    coverImage: z.string().regex(/^\/media\/[a-zA-Z0-9/_.-]+$/, 'Use a local image path under /media/').optional(),
    coverAlt: z.string().optional(),
    tools: z.array(z.string()).default([]), links: z.array(z.object({ label: z.string(), url: z.url() })).default([]),
    note: z.string().optional(),
  }),
});
const contributions = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/contributions' }),
  schema: z.object({
    ...common, title: z.string(), repository: z.string(), summary: z.string(),
    type: z.enum(['Resources', 'Code', 'Infrastructure', 'Learning', 'Website']), featured: z.boolean().default(false),
    spotlight: z.boolean().default(false), projectUrl: z.url().optional(), evidenceUrl: z.url().optional(),
    relationship: z.enum(['Upstream', 'Organization', 'Personal fork']),
    status: z.enum(['Merged', 'Open', 'Closed', 'Published']), mergedAt: z.string().optional(),
    url: z.url(), pr: z.number().int().positive().optional(), event: z.string().optional(),
  }).refine((data) => data.status === 'Published' || data.pr !== undefined, {
    message: 'PR entries require a PR number. Use Published for work published without a PR.', path: ['pr'],
  }),
});
const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({ ...common, title: z.string(), summary: z.string(), date: z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/), platform: z.string(), url: z.url(), tags: z.array(z.string()).default([]) }),
});
const experience = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/experience' }),
  schema: z.object({ ...common, title: z.string(), role: z.string(), summary: z.string() }),
});
const milestones = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/milestones' }),
  schema: z.object({ ...common, title: z.string(), year: z.string().optional(), summary: z.string(), kind: z.string(), url: z.url().optional(), featured: z.boolean().default(false) }),
});
export const collections = { projects, contributions, notes, experience, milestones };
