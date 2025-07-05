// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview Generates a background image based on the city the user searches for.
 *
 * - generateCityBackground - A function that generates a relevant background image based on the city name.
 * - GenerateCityBackgroundInput - The input type for the generateCityBackground function.
 * - GenerateCityBackgroundOutput - The return type for the generateCityBackground function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCityBackgroundInputSchema = z.object({
  city: z.string().describe('The city name to generate a background image for.'),
});
export type GenerateCityBackgroundInput = z.infer<
  typeof GenerateCityBackgroundInputSchema
>;

const GenerateCityBackgroundOutputSchema = z.object({
  backgroundImage: z
    .string()
    .describe(
      'A data URI containing the generated background image for the city.'
    ),
});
export type GenerateCityBackgroundOutput = z.infer<
  typeof GenerateCityBackgroundOutputSchema
>;

export async function generateCityBackground(
  input: GenerateCityBackgroundInput
): Promise<GenerateCityBackgroundOutput> {
  return generateCityBackgroundFlow(input);
}

const generateCityBackgroundPrompt = ai.definePrompt({
  name: 'generateCityBackgroundPrompt',
  input: {schema: GenerateCityBackgroundInputSchema},
  output: {schema: GenerateCityBackgroundOutputSchema},
  prompt: `Generate a beautiful skyline background image for the city of {{city}}. The image should be a data URI.`, // Ensure the output is a data URI
});

const generateCityBackgroundFlow = ai.defineFlow(
  {
    name: 'generateCityBackgroundFlow',
    inputSchema: GenerateCityBackgroundInputSchema,
    outputSchema: GenerateCityBackgroundOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate a beautiful skyline background image for the city of ${input.city}.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Failed to generate image');
    }

    return {backgroundImage: media.url};
  }
);
