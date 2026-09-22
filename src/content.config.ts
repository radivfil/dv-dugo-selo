/**
 * Sadržajne kolekcije koje tajništvo uređuje kroz Sveltia CMS (/admin).
 * Polja moraju odgovarati onima u public/admin/config.yml.
 * Slike i PDF-ovi su obične putanje iz /public (npr. /uploads/slika.jpg, /dokumenti/statut.pdf),
 * jer ih CMS sprema u public/.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { site } from './config/site';

const novosti = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/novosti' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
  }),
});

const jelovnik = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/jelovnik' }),
  schema: z.object({
    week: z.string(),
    note: z.string().optional(),
    days: z.array(
      z.object({
        day: z.string(),
        breakfast: z.string(),
        lunch: z.string(),
        snack: z.string(),
      }),
    ),
  }),
});

const dokumenti = defineCollection({
  loader: glob({ pattern: '*.{yml,yaml}', base: './src/content/dokumenti' }),
  schema: z.object({
    title: z.string(),
    category: z.enum(site.documentCategories as unknown as [string, ...string[]]),
    date: z.coerce.date(),
    file: z.string(),
    description: z.string().optional(),
  }),
});

const galerija = defineCollection({
  loader: glob({ pattern: '*.{yml,yaml}', base: './src/content/galerija' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.string(),
    image: z.string().optional(),
    alt: z.string(),
    size: z.enum(['normal', 'wide', 'tall', 'large']).default('normal'),
  }),
});

export const collections = { novosti, jelovnik, dokumenti, galerija };
