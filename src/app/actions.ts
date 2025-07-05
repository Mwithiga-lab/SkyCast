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
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;

  if (!apiKey || apiKey === 'YOUR_OPENWEATHERMAP_API_KEY') {
    console.error('OpenWeatherMap API key is not set.');
    return {
      error: 'The weather service is not configured. Please create a .env.local file with your OPENWEATHERMAP_API_KEY.',
    };
  }

  try {
    const [weatherResponse, backgroundResult] = await Promise.all([
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      ),
      generateCityBackground({ city }),
    ]);

    if (!weatherResponse.ok) {
      const errorData = await weatherResponse.json();
      return { error: errorData.message || 'City not found.' };
    }

    const weatherData: WeatherData = await weatherResponse.json();
    const backgroundImage = backgroundResult.backgroundImage;

    return { weatherData, backgroundImage };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { error: `Failed to fetch data: ${errorMessage}` };
  }
}
