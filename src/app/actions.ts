'use server';

import { generateBackgroundKeywords } from '@/ai/flows/generate-city-background';
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

  if (!weatherApiKey || weatherApiKey.includes('YOUR_OPENWEATHERMAP_API_KEY')) {
    return {
      error: 'The weather service is not configured. Please add your OPENWEATHERMAP_API_KEY to the .env.local file.',
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

  const googleApiKey = process.env.GOOGLE_API_KEY;
  if (!googleApiKey || googleApiKey.includes('YOUR_GOOGLE_API_KEY')) {
    // If Google API key is missing, return weather data with a warning about the background.
    return { 
      weatherData, 
      error: 'AI background service is not configured. Please add GOOGLE_API_KEY to .env.local to enable backgrounds.' 
    };
  }

  const keywordsResult = await generateBackgroundKeywords({ 
    city,
    weather: weatherData.weather[0]?.description || 'weather',
  });

  if (keywordsResult.error || !keywordsResult.keywords) {
    console.error('AI background keyword generation failed:', keywordsResult.error);
    const displayError = `The AI background service failed to find an image for "${city}". Displaying weather without a background.`;
    return { weatherData, error: displayError };
  }
  
  const keywords = keywordsResult.keywords;
  const backgroundImageUrl = `https://source.unsplash.com/1600x900/?${encodeURIComponent(keywords)}`;

  return { weatherData, backgroundImage: backgroundImageUrl };
}
