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
    .optional()
    .describe(
      'A data URI containing the generated background image for the city.'
    ),
  error: z.string().optional().describe('An error message if image generation failed.'),
});
export type GenerateCityBackgroundOutput = z.infer<
  typeof GenerateCityBackgroundOutputSchema
>;

export async function generateCityBackground(
  input: GenerateCityBackgroundInput
): Promise<GenerateCityBackgroundOutput> {
  return generateCityBackgroundFlow(input);
}

const generateCityBackgroundFlow = ai.defineFlow(
  {
    name: 'generateCityBackgroundFlow',
    inputSchema: GenerateCityBackgroundInputSchema,
    outputSchema: GenerateCityBackgroundOutputSchema,
  },
  async (input): Promise<GenerateCityBackgroundOutput> => {
    try {
      const { media, text } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: `A beautiful, photorealistic, wide-angle photo of the skyline of the city of ${input.city}. This is for a weather app background. The image should be scenic and high quality.`,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
          safetySettings: [
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          ],
        },
      });

      if (!media?.url) {
        const reason = text || 'No media content was returned from the AI model.';
        console.error("Image generation failed:", reason);
        return { error: `Failed to generate background. Reason: ${reason}` };
      }

      return {backgroundImage: media.url};
    } catch (e: any) {
        console.error("Critical error in image generation flow:", e);
        return { error: 'An unexpected error occurred during image generation.' };
    }
  }
);
