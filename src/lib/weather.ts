import { Cloud, CloudDrizzle, CloudLightning, CloudRain, CloudSun, CloudMoon, Cloudy, Moon, Snowflake, Sun, Wind, Thermometer } from 'lucide-react';

export const getWeatherIcon = (iconCode: string) => {
  switch (iconCode) {
    case '01d':
      return Sun;
    case '01n':
      return Moon;
    case '02d':
      return CloudSun;
    case '02n':
      return CloudMoon;
    case '03d':
    case '03n':
      return Cloud;
    case '04d':
    case '04n':
      return Cloudy;
    case '09d':
    case '09n':
      return CloudRain;
    case '10d':
    case '10n':
      return CloudDrizzle;
    case '11d':
    case '11n':
      return CloudLightning;
    case '13d':
    case '13n':
      return Snowflake;
    case '50d':
    case '50n':
      return Wind;
    default:
      return Thermometer;
  }
};
