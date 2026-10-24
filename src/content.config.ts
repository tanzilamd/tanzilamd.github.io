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
  schema: z.discriminatedUnion('kind', [
    z.object({
      ...common, kind: z.literal('post'), title: z.string(), summary: z.string(),
      date: z.iso.date(), updated: z.iso.date().optional(),
      dateWritten: z.union([z.string().regex(/^\d{4}$/), z.iso.date()]).optional(),
      context: z.string().optional(), genre: z.enum(['Article', 'Essay', 'Note']).default('Article'),
      tags: z.array(z.string()).default([]), featured: z.boolean().default(false),
    }),
    z.object({
      ...common, kind: z.literal('external'), title: z.string(), summary: z.string(),
      date: z.union([z.iso.date(), z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/)]),
      updated: z.iso.date().optional(), platform: z.string(), url: z.url(),
      tags: z.array(z.string()).default([]), featured: z.boolean().default(false),
    }),
  ]).refine((data) => !data.updated || data.updated >= data.date, {
    message: 'Updated date must be on or after the publication date.', path: ['updated'],
  }),
});
const activities = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/activities' }),
  schema: z.object({
    ...common, title: z.string(), label: z.string(), summary: z.string(),
    art: z.enum(['debate', 'theatre', 'community']).default('community'),
    featured: z.boolean().default(true),
    homePreview: z.boolean().default(false),
    gallery: z.array(z.object({
      src: z.string().regex(/^\/media\/activities\/[a-zA-Z0-9/_.-]+$/, 'Keep activity images under /media/activities/.'),
      alt: z.string().trim().min(1), caption: z.string().trim().min(1),
      event: z.string().optional(), year: z.string().regex(/^\d{4}$/).optional(),
      role: z.string().optional(), demo: z.boolean().default(false),
    })).default([]),
  }),
});
const experience = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/experience' }),
  schema: z.object({ ...common, title: z.string(), role: z.string(), summary: z.string() }),
});
const milestones = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/milestones' }),
  schema: ({ image }) => z.object({
    ...common, title: z.string(), year: z.string().optional(), summary: z.string(), kind: z.string(),
    url: z.url().optional(), urlLabel: z.string().trim().min(1).default('View details'),
    featured: z.boolean().default(false),
    image: image().optional(), imageAlt: z.string().trim().min(1).optional(),
    imageLabel: z.string().trim().min(1).default('View image'),
    imagePresentation: z.enum(['evidence', 'badge']).default('evidence'),
  }).refine((data) => !data.image || !!data.imageAlt, { message: 'Recognition images need an informative imageAlt.', path: ['imageAlt'] }),
});
export const collections = { projects, contributions, notes, activities, experience, milestones };
