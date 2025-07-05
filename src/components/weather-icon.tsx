import { getWeatherIcon } from '@/lib/weather';
import type { LucideProps } from 'lucide-react';

interface WeatherIconProps extends LucideProps {
  iconCode: string;
}

export function WeatherIcon({ iconCode, ...props }: WeatherIconProps) {
  const IconComponent = getWeatherIcon(iconCode);
  return <IconComponent {...props} />;
}
