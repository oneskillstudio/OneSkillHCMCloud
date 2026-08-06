import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    module: z.string().optional(), // e.g. "Absence Management", "Time and Labor"
    category: z.enum(['Technical', 'Functional', 'Trainings']).optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
