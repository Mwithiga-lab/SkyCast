'use server';

/**
 * @fileOverview Generates search keywords for a background image based on a city and weather.
 *
 * - generateBackgroundKeywords - A function that generates keywords for a background image.
 * - GenerateBackgroundKeywordsInput - The input type for the function.
 * - GenerateBackgroundKeywordsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBackgroundKeywordsInputSchema = z.object({
  city: z.string().describe('The city name to generate keywords for.'),
  weather: z
    .string()
    .describe(
      'The current weather description (e.g., "clear sky", "light rain").'
    ),
});
export type GenerateBackgroundKeywordsInput = z.infer<
  typeof GenerateBackgroundKeywordsInputSchema
>;

const GenerateBackgroundKeywordsOutputSchema = z.object({
  keywords: z
    .string()
    .optional()
    .describe(
      'A comma-separated string of 1-3 keywords for an image search.'
    ),
  error: z
    .string()
    .optional()
    .describe('An error message if keyword generation failed.'),
});
export type GenerateBackgroundKeywordsOutput = z.infer<
  typeof GenerateBackgroundKeywordsOutputSchema
>;

export async function generateBackgroundKeywords(
  input: GenerateBackgroundKeywordsInput
): Promise<GenerateBackgroundKeywordsOutput> {
  return generateBackgroundKeywordsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBackgroundKeywordsPrompt',
  input: {schema: GenerateBackgroundKeywordsInputSchema},
  output: {
    schema: z.object({
      keywords: z
        .string()
        .describe(
          'A comma-separated string of 1-3 keywords for an image search. Be specific and scenic.'
        ),
    }),
  },
  prompt: `You are an expert at selecting beautiful, scenic background images for a weather app.
  
  Based on the city and current weather, provide 1-3 concise, comma-separated keywords for a photo search. The keywords should focus on iconic landmarks or scenic views of the city that match the weather.
  
  City: {{{city}}}
  Weather: {{{weather}}}
  
  Example for Paris with "clear sky": eiffel tower, sunny
  Example for London with "light rain": tower bridge, moody
  Example for Tokyo with "cloudy": shibuya crossing, overcast`,
});

const generateBackgroundKeywordsFlow = ai.defineFlow(
  {
    name: 'generateBackgroundKeywordsFlow',
    inputSchema: GenerateBackgroundKeywordsInputSchema,
    outputSchema: GenerateBackgroundKeywordsOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output?.keywords) {
        return {error: 'Failed to generate keywords from AI.'};
      }
      const sanitizedKeywords = output.keywords.replace(/[^a-zA-Z0-9,\s]/g, '');
      return {keywords: sanitizedKeywords};
    } catch (e: any) {
      console.error('Critical error in keyword generation flow:', e);
      return {error: 'An unexpected error occurred during keyword generation.'};
    }
  }
);
