import { z } from 'zod';

export const transcriptionSchema = z.object({
  body: z.object({
    audioUrl: z
      .string()
      .url('Invalid audio URL format')
      .min(1, 'Audio URL is required'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const azureTranscriptionSchema = z.object({
  body: z.object({
    audioUrl: z
      .string()
      .url('Invalid audio URL format')
      .min(1, 'Audio URL is required'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

