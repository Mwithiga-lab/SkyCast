'use client';

import { useState } from 'react';
import type { WeatherData } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WeatherIcon } from '@/components/weather-icon';
import { Droplets, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WeatherDisplayProps {
  data: WeatherData;
}

export function WeatherDisplay({ data }: WeatherDisplayProps) {
  const [unit, setUnit] = useState<'C' | 'F'>('C');

  const temperature = unit === 'C' ? data.main.temp : (data.main.temp * 9) / 5 + 32;
  const feelsLike = unit === 'C' ? data.main.feels_like : (data.main.feels_like * 9) / 5 + 32;

  const toggleUnit = () => {
    setUnit((prevUnit) => (prevUnit === 'C' ? 'F' : 'C'));
  };

  return (
    <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm transition-all duration-500 animate-in fade-in zoom-in-95">
      <CardHeader className="text-center">
        <CardTitle className="text-4xl font-bold">{data.name}, {data.sys.country}</CardTitle>
        <CardDescription className="text-lg capitalize">{data.weather[0].description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6">
        <div className="flex items-center space-x-4">
          <WeatherIcon iconCode={data.weather[0].icon} className="h-24 w-24 text-accent" />
          <div>
            <p className="text-7xl font-bold">{Math.round(temperature)}°{unit}</p>
            <p className="text-muted-foreground">Feels like {Math.round(feelsLike)}°{unit}</p>
          </div>
        </div>
        <Button onClick={toggleUnit} variant="outline" size="sm" className="bg-background/70">
          Switch to °{unit === 'C' ? 'F' : 'C'}
        </Button>
        <div className="w-full grid grid-cols-2 gap-4 text-center pt-4 border-t">
            <div className="flex flex-col items-center space-y-1">
                <Droplets className="h-6 w-6 text-primary" />
                <span className="font-semibold">Humidity</span>
                <span className="text-muted-foreground">{data.main.humidity}%</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
                <Wind className="h-6 w-6 text-primary" />
                <span className="font-semibold">Wind Speed</span>
                <span className="text-muted-foreground">{data.wind.speed.toFixed(1)} m/s</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
