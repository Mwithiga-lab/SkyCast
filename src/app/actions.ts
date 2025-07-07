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

  if (!weatherApiKey || weatherApiKey === 'YOUR_OPENWEATHERMAP_API_KEY') {
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
    console.error('AI background generation failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    let displayError = `Could not generate background: ${errorMessage}`;

    if (errorMessage.includes('API key not valid') || errorMessage.includes('FAILED_PRECONDITION')) {
        displayError = 'Your Google AI API key is invalid or missing. Please check the GOOGLE_API_KEY in your .env.local file.';
    } else if (errorMessage.includes('No media content was returned')) {
        displayError = `The AI could not generate a background for "${city}".`;
    }
    
    return { weatherData, error: displayError };
  }

  return { weatherData, backgroundImage };
}
