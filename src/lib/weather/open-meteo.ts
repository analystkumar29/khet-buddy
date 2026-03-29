// Default fallback coordinates (Fatehabad, Haryana)
const DEFAULT_LAT = 29.5152;
const DEFAULT_LON = 75.4548;

export type CurrentWeather = {
  temperature: number;
  humidity: number;
  wind_speed: number;
  rain_probability: number;
  weather_code: number;
  weather_description_hi: string;
  weather_description_en: string;
};

export type DailyForecast = {
  date: string;
  temp_max: number;
  temp_min: number;
  rain_probability: number;
  rain_sum: number;
  weather_code: number;
  description_hi: string;
  description_en: string;
};

const WEATHER_CODES: Record<number, { en: string; hi: string }> = {
  0: { en: "Clear sky", hi: "साफ़ आसमान" },
  1: { en: "Mainly clear", hi: "ज़्यादातर साफ़" },
  2: { en: "Partly cloudy", hi: "आंशिक बादल" },
  3: { en: "Overcast", hi: "बादल छाए" },
  45: { en: "Foggy", hi: "कोहरा" },
  48: { en: "Depositing rime fog", hi: "घना कोहरा" },
  51: { en: "Light drizzle", hi: "हल्की बूंदाबांदी" },
  53: { en: "Moderate drizzle", hi: "बूंदाबांदी" },
  55: { en: "Dense drizzle", hi: "तेज़ बूंदाबांदी" },
  61: { en: "Slight rain", hi: "हल्की बारिश" },
  63: { en: "Moderate rain", hi: "बारिश" },
  65: { en: "Heavy rain", hi: "तेज़ बारिश" },
  80: { en: "Slight showers", hi: "हल्की बौछार" },
  81: { en: "Moderate showers", hi: "बौछार" },
  82: { en: "Violent showers", hi: "तेज़ बौछार" },
  95: { en: "Thunderstorm", hi: "आंधी-तूफान" },
  96: { en: "Thunderstorm with hail", hi: "ओलावृष्टि" },
  99: { en: "Thunderstorm with heavy hail", hi: "भारी ओलावृष्टि" },
};

function getWeatherDescription(code: number): { en: string; hi: string } {
  return WEATHER_CODES[code] || { en: "Unknown", hi: "अज्ञात" };
}

export async function getCurrentWeather(
  lat: number = DEFAULT_LAT,
  lon: number = DEFAULT_LON
): Promise<CurrentWeather> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=precipitation_probability_max&timezone=Asia/Kolkata&forecast_days=1`;

  const res = await fetch(url, { next: { revalidate: 1800 } });
  const data = await res.json();

  const desc = getWeatherDescription(data.current.weather_code);

  return {
    temperature: Math.round(data.current.temperature_2m),
    humidity: data.current.relative_humidity_2m,
    wind_speed: Math.round(data.current.wind_speed_10m),
    rain_probability: data.daily.precipitation_probability_max[0] || 0,
    weather_code: data.current.weather_code,
    weather_description_hi: desc.hi,
    weather_description_en: desc.en,
  };
}

export async function get7DayForecast(
  lat: number = DEFAULT_LAT,
  lon: number = DEFAULT_LON
): Promise<DailyForecast[]> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,weather_code&timezone=Asia/Kolkata&forecast_days=7`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  const data = await res.json();

  return data.daily.time.map((date: string, i: number) => {
    const desc = getWeatherDescription(data.daily.weather_code[i]);
    return {
      date,
      temp_max: Math.round(data.daily.temperature_2m_max[i]),
      temp_min: Math.round(data.daily.temperature_2m_min[i]),
      rain_probability: data.daily.precipitation_probability_max[i],
      rain_sum: data.daily.precipitation_sum[i],
      weather_code: data.daily.weather_code[i],
      description_hi: desc.hi,
      description_en: desc.en,
    };
  });
}

export async function willRainIn24Hours(
  lat: number = DEFAULT_LAT,
  lon: number = DEFAULT_LON
): Promise<{
  willRain: boolean;
  rainMm: number;
}> {
  const forecast = await get7DayForecast(lat, lon);
  const today = forecast[0];
  return {
    willRain: today.rain_sum > 5,
    rainMm: today.rain_sum,
  };
}
