'use server';

import { generateCityBackground } from '@/ai/flows/generate-city-background';
import type { WeatherApiResponse, WeatherData } from '@/lib/types';
import { z } from 'zod';

const SearchSchema = z.object({
  city: z.string().min(2, { message: 'City must be at least 2 characters.' }),
});

export async function getWeatherData(
  prevState: WeatherApiResponse | undefined,
  formData: FormData
): Promise<WeatherApiResponse> {
  const validatedFields = SearchSchema.safeParse({
    city: formData.get('city'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.city?.[0],
    };
  }

  const city = validatedFields.data.city;
  const weatherApiKey = process.env.OPENWEATHERMAP_API_KEY;
  const googleApiKey = process.env.GOOGLE_API_KEY;

  if (!weatherApiKey || weatherApiKey.includes('YOUR_OPENWEATHERMAP_API_KEY')) {
    return {
      error: 'The weather service is not configured. Please add your OPENWEATHERMAP_API_KEY to the .env.local file.',
    };
  }

  if (!googleApiKey || googleApiKey.includes('YOUR_GOOGLE_API_KEY')) {
    return {
      error: 'The AI background service is not configured. Please get a Google AI API key and add it to your .env.local file.',
    };
  }
  
  let weatherData: WeatherData;
  try {
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`
    );

    if (!weatherResponse.ok) {
      const errorData = await weatherResponse.json();
      return { error: errorData.message || 'City not found.' };
    }
    weatherData = await weatherResponse.json();
  } catch (error) {
    console.error('Weather fetch error:', error);
    return { error: 'Failed to fetch weather data.' };
  }

  let backgroundImage: string | undefined;
  try {
    const backgroundResult = await generateCityBackground({ city });
    backgroundImage = backgroundResult.backgroundImage;
  } catch (error) {
    // Log the detailed error for server-side debugging.
    console.error('AI background generation failed:', error);
    
    // Create a safe, user-friendly error message. This is more defensive to prevent serialization errors.
    let displayError: string;

    if (error instanceof Error && error.message) {
      const msg = error.message.toLowerCase();
      if (msg.includes('api key') || msg.includes('permission denied') || msg.includes('failed_precondition')) {
        displayError = 'The AI background service API key is invalid or missing. Please check your .env.local file.';
      } else if (msg.includes('deadline_exceeded')) {
        displayError = 'The AI background service timed out. Please try again.';
      } else if (msg.includes('no media content') || msg.includes('no image content')) {
        displayError = `The AI was unable to create an image for "${city}". It may not be a recognized city.`;
      }
      else {
        // A catch-all for other errors from the AI service.
        displayError = `The AI background service failed. Please try a different city.`;
      }
    } else {
      // Fallback for unexpected, non-Error objects.
      displayError = 'An unknown error occurred with the AI background service.';
    }
    
    // Return the weather data with a clear error message about the background failure.
    return { weatherData, error: displayError };
  }

  return { weatherData, backgroundImage };
}
