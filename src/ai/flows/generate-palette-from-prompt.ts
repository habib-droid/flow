'use server';
/**
 * @fileOverview An AI assistant that generates color palettes based on natural language prompts.
 *
 * - generatePaletteFromPrompt - A function that handles the palette generation process.
 * - GeneratePaletteFromPromptInput - The input type for the generatePaletteFromPrompt function.
 * - GeneratePaletteFromPromptOutput - The return type for the generatePaletteFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePaletteFromPromptInputSchema = z.object({
  prompt: z
    .string()
    .describe('A natural language prompt describing the desired color palette.'),
});
export type GeneratePaletteFromPromptInput = z.infer<
  typeof GeneratePaletteFromPromptInputSchema
>;

const GeneratePaletteFromPromptOutputSchema = z.object({
  palette: z
    .array(z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/))
    .min(5)
    .max(10)
    .describe('An array of 5 to 10 hex color codes (e.g., #RRGGBB).'),
  reasoning: z
    .string()
    .describe('A short explanation for the generated color palette.'),
});
export type GeneratePaletteFromPromptOutput = z.infer<
  typeof GeneratePaletteFromPromptOutputSchema
>;

export async function generatePaletteFromPrompt(
  input: GeneratePaletteFromPromptInput
): Promise<GeneratePaletteFromPromptOutput> {
  return generatePaletteFromPromptFlow(input);
}

const palettePrompt = ai.definePrompt({
  name: 'palettePrompt',
  input: {schema: GeneratePaletteFromPromptInputSchema},
  output: {schema: GeneratePaletteFromPromptOutputSchema},
  prompt: `You are an AI-powered color palette assistant named Palette Wave.
Your goal is to generate a beautiful, harmonious, and relevant color palette based on the user's natural language request.

Instructions:
1. Generate a palette containing 5 to 10 hex color codes that match the user's description.
2. Provide a short, concise reasoning for your color choices, explaining why they fit the prompt.
3. Ensure all color codes are valid 6-digit or 3-digit hexadecimal values (e.g., #RRGGBB or #RGB).
4. Your response MUST be a JSON object conforming strictly to the following schema:

Output Schema: {"palette": string[], "reasoning": string}

User request: {{{prompt}}}`,
});

const generatePaletteFromPromptFlow = ai.defineFlow(
  {
    name: 'generatePaletteFromPromptFlow',
    inputSchema: GeneratePaletteFromPromptInputSchema,
    outputSchema: GeneratePaletteFromPromptOutputSchema,
  },
  async input => {
    const {output} = await palettePrompt(input);
    return output!;
  }
);
