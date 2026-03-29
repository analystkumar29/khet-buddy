import { createServiceClient } from "@/lib/supabase/server";
import {
  getCachedPrices,
  fetchAndCachePrices,
} from "@/lib/mandi/fetch-prices";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cropKey = searchParams.get("crop") || "apple_ber";
    const state = searchParams.get("state") || undefined;
    const district = searchParams.get("district") || undefined;

    const supabase = createServiceClient();

    // Get cached prices
    const { prices, isStale } = await getCachedPrices(
      supabase,
      cropKey,
      state,
      district
    );

    // If stale, refresh in background (don't block the response)
    if (isStale) {
      // Fire and forget — don't await
      fetchAndCachePrices(supabase, cropKey, state).catch((err) =>
        console.error("Background price refresh failed:", err)
      );
    }

    // Compute summary stats
    const today = new Date().toISOString().split("T")[0];
    const todayPrices = prices.filter((p) => p.price_date === today);
    const latestPrices =
      todayPrices.length > 0
        ? todayPrices
        : prices.length > 0
          ? prices.filter((p) => p.price_date === prices[0].price_date)
          : [];

    // Best mandi (highest modal price today)
    const bestMandi = latestPrices.reduce(
      (best, p) =>
        p.price_per_quintal > (best?.price_per_quintal || 0) ? p : best,
      latestPrices[0] || null
    );

    // Price trend: compare latest vs 7 days ago
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split("T")[0];

    const oldPrices = prices.filter((p) => p.price_date <= weekAgoStr);
    const avgCurrent =
      latestPrices.length > 0
        ? latestPrices.reduce((s, p) => s + p.price_per_quintal, 0) /
          latestPrices.length
        : 0;
    const avgOld =
      oldPrices.length > 0
        ? oldPrices.reduce((s, p) => s + p.price_per_quintal, 0) /
          oldPrices.length
        : avgCurrent;

    const trend =
      avgCurrent > avgOld * 1.05
        ? "rising"
        : avgCurrent < avgOld * 0.95
          ? "falling"
          : "stable";

    // Unique mandis with latest prices
    const mandiMap = new Map<
      string,
      { mandi: string; district: string; state: string; price: number; date: string }
    >();
    for (const p of latestPrices) {
      if (!mandiMap.has(p.mandi_name) || p.price_per_quintal > mandiMap.get(p.mandi_name)!.price) {
        mandiMap.set(p.mandi_name, {
          mandi: p.mandi_name,
          district: p.district,
          state: p.state,
          price: p.price_per_quintal,
          date: p.price_date,
        });
      }
    }

    return Response.json({
      crop: cropKey,
      prices: Array.from(mandiMap.values()).sort((a, b) => b.price - a.price),
      allPrices: prices.slice(0, 100), // For trend charts
      summary: {
        bestMandi: bestMandi
          ? {
              name: bestMandi.mandi_name,
              district: bestMandi.district,
              price: bestMandi.price_per_quintal,
            }
          : null,
        avgPrice: Math.round(avgCurrent),
        trend,
        lastUpdated: prices[0]?.price_date || null,
        totalMandis: mandiMap.size,
      },
      isStale,
    });
  } catch (error) {
    console.error("Mandi prices route error:", error);
    return Response.json(
      { error: "Failed to fetch mandi prices" },
      { status: 500 }
    );
  }
}
