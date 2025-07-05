'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useState } from 'react';
import { getWeatherData } from '@/app/actions';
import type { WeatherApiResponse } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { WeatherDisplay } from '@/components/weather-display';
import { WeatherSkeleton } from '@/components/weather-skeleton';
import { Cloud, Search } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? 'Searching...' : <><Search className="mr-2 h-4 w-4" /> Search</>}
    </Button>
  );
}

function FormResults({ state }: { state: WeatherApiResponse | undefined }) {
  const { pending } = useFormStatus();
  
  if (pending) {
    return <WeatherSkeleton />;
  }

  if (state?.weatherData) {
    return <WeatherDisplay data={state.weatherData} />;
  }

  return (
    <div className="text-center text-primary-foreground/70 drop-shadow animate-in fade-in">
      <Cloud className="mx-auto h-16 w-16" />
      <p className="mt-4 text-lg">Search for a city to see the weather.</p>
    </div>
  );
}


export default function Home() {
  const { toast } = useToast();
  const [state, formAction] = useFormState<WeatherApiResponse | undefined, FormData>(
    getWeatherData,
    undefined
  );
  const [background, setBackground] = useState<string>('');

  useEffect(() => {
    if (state?.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
    }
    if (state?.backgroundImage) {
      setBackground(state.backgroundImage);
    }
  }, [state, toast]);

  return (
    <>
      <div 
        className="fixed inset-0 -z-10 h-full w-full bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url(${background})` }}
        data-ai-hint="skyline background"
      />
      <div className="fixed inset-0 -z-10 bg-background/50 backdrop-blur-sm" />
      
      <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8">
        <form action={formAction} className="w-full max-w-md space-y-6">
          <header className="text-center">
            <h1 className="font-headline text-5xl font-bold tracking-tight text-primary-foreground/90 drop-shadow-lg">
              SkyCast
            </h1>
            <p className="mt-2 text-lg text-primary-foreground/80 drop-shadow">
              Your weather forecast, beautifully visualized.
            </p>
          </header>

          <div className="flex w-full items-center space-x-2">
            <Input
              type="text"
              name="city"
              placeholder="Enter a city name..."
              required
              className="flex-grow bg-card/80 placeholder:text-muted-foreground/80"
              aria-label="City Name"
            />
            <SubmitButton />
          </div>

          <div className="w-full min-h-[380px] flex items-center justify-center">
            <FormResults state={state} />
          </div>
        </form>
      </main>
    </>
  );
}
