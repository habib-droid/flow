'use server';
/**
 * @fileOverview A Genkit flow for extracting a color palette from an uploaded image.
 *
 * - extractPaletteFromImage - A function that handles the image analysis and color extraction process.
 * - ExtractPaletteFromImageInput - The input type for the extractPaletteFromImage function.
 * - ExtractPaletteFromImageOutput - The return type for the extractPaletteFromImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExtractPaletteFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of an image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  numberOfColors: z.number().int().min(1).max(10).default(5).describe('The desired number of dominant colors to extract, between 1 and 10.'),
});
export type ExtractPaletteFromImageInput = z.infer<typeof ExtractPaletteFromImageInputSchema>;

const ExtractPaletteFromImageOutputSchema = z.object({
  colors: z
    .array(z.string().regex(/^#[0-9a-fA-F]{6}$/i))
    .max(10)
    .describe('An array of dominant hex color codes extracted from the image, e.g., ["#RRGGBB", "#RRGGBB", ...].'),
  reasoning: z.string().describe('A short reasoning explaining why these colors were chosen and their general mood or theme.'),
});
export type ExtractPaletteFromImageOutput = z.infer<typeof ExtractPaletteFromImageOutputSchema>;

export async function extractPaletteFromImage(
  input: ExtractPaletteFromImageInput
): Promise<ExtractPaletteFromImageOutput> {
  return extractPaletteFromImageFlow(input);
}

const extractPalettePrompt = ai.definePrompt({
  name: 'extractPaletteFromImagePrompt',
  input: { schema: ExtractPaletteFromImageInputSchema },
  output: { schema: ExtractPaletteFromImageOutputSchema },
  prompt: `You are an expert color theorist and AI assistant for the Palette Wave application. Your task is to analyze the provided image and extract a harmonious color palette containing exactly {{numberOfColors}} dominant colors.\n\nFor each color, provide its hexadecimal code (e.g., #RRGGBB). The colors should be representative of the overall mood, theme, and visual content of the image.\n\nAfter listing the colors, provide a short, concise reasoning explaining the palette's overall mood, theme, or how it relates to the image.\n\nImage: {{media url=photoDataUri}}\n\nReturn the output as a JSON object with two fields: 'colors' (an array of hex strings) and 'reasoning' (a string).\nEnsure the 'colors' array contains exactly {{numberOfColors}} hex codes.`,
});

const extractPaletteFromImageFlow = ai.defineFlow(
  {
    name: 'extractPaletteFromImageFlow',
    inputSchema: ExtractPaletteFromImageInputSchema,
    outputSchema: ExtractPaletteFromImageOutputSchema,
  },
  async (input) => {
    const { output } = await extractPalettePrompt(input);
    if (!output) {
      throw new Error('Failed to extract palette from image: AI did not return an output.');
    }
    return output;
  }
);
