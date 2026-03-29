import { getCurrentWeather, get7DayForecast } from "@/lib/weather/open-meteo";

export const revalidate = 1800; // cache 30 minutes

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat")
      ? parseFloat(searchParams.get("lat")!)
      : undefined;
    const lon = searchParams.get("lon")
      ? parseFloat(searchParams.get("lon")!)
      : undefined;

    const [current, forecast] = await Promise.all([
      getCurrentWeather(lat, lon),
      get7DayForecast(lat, lon),
    ]);

    return Response.json({ current, forecast });
  } catch (error) {
    console.error("Weather forecast route error:", error);
    return Response.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}
