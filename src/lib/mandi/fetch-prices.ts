/**
 * Mandi price fetcher using data.gov.in API.
 *
 * Fetches daily commodity prices from Indian mandis and caches in Supabase.
 * Free tier: 10,000 requests/day.
 *
 * API docs: https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi
 */

import type { SupabaseClient } from "@supabase/supabase-js";

// Variety-wise dataset has historical + current data with proper commodity names
const DATA_GOV_RESOURCE_ID = "35985678-0d79-46b4-9ed6-6f13308a1d24";
const CACHE_HOURS = 6; // Refresh every 6 hours

// Mapping from our crop_key to the commodity filter value in data.gov.in
// The variety-wise dataset uses "Ber" as the commodity filter
const CROP_COMMODITY_MAP: Record<string, string[]> = {
  apple_ber: ["Ber"],
  kinnow: ["Kinnow"],
  guava: ["Guava"],
  lemon: ["Lemon"],
};

// States we support
const SUPPORTED_STATES = ["Haryana", "Punjab", "Uttar Pradesh", "Rajasthan"];

type DataGovRecord = {
  State: string;
  District: string;
  Market: string;
  Commodity: string;
  Variety: string;
  Grade: string;
  Arrival_Date: string;
  Min_Price: number | string;
  Max_Price: number | string;
  Modal_Price: number | string;
};

type DataGovResponse = {
  records: DataGovRecord[];
  total: number;
  count: number;
};

/**
 * Fetch fresh mandi prices from data.gov.in and cache in Supabase.
 */
export async function fetchAndCachePrices(
  supabase: SupabaseClient,
  cropKey: string,
  state?: string
): Promise<{ cached: number; fresh: number }> {
  const apiKey = process.env.DATA_GOV_IN_API_KEY;
  if (!apiKey) {
    console.warn("DATA_GOV_IN_API_KEY not set, skipping mandi price fetch");
    return { cached: 0, fresh: 0 };
  }

  const commodityNames = CROP_COMMODITY_MAP[cropKey];
  if (!commodityNames) {
    return { cached: 0, fresh: 0 };
  }

  let totalInserted = 0;

  // Fetch for each supported state (or specific state)
  const states = state ? [state] : SUPPORTED_STATES;

  for (const stateFilter of states) {
    for (const commodity of commodityNames) {
      try {
        const url = new URL(
          `https://api.data.gov.in/resource/${DATA_GOV_RESOURCE_ID}`
        );
        url.searchParams.set("api-key", apiKey);
        url.searchParams.set("format", "json");
        url.searchParams.set("limit", "100");
        url.searchParams.set("sort[Arrival_Date]", "desc");
        url.searchParams.set("filters[State]", stateFilter);
        url.searchParams.set("filters[commodity]", commodity);

        const res = await fetch(url.toString(), {
          next: { revalidate: CACHE_HOURS * 3600 },
        });

        if (!res.ok) continue;

        const data: DataGovResponse = await res.json();
        if (!data.records || data.records.length === 0) continue;

        // Transform and upsert into mandi_prices
        const rows = data.records
          .filter((r) => r.Modal_Price && Number(r.Modal_Price) > 0)
          .map((r) => ({
            crop_key: cropKey,
            mandi_name: r.Market,
            district: r.District,
            state: r.State,
            price_per_quintal: Number(r.Modal_Price),
            min_price: r.Min_Price ? Number(r.Min_Price) : null,
            max_price: r.Max_Price ? Number(r.Max_Price) : null,
            price_date: parseArrivalDate(r.Arrival_Date),
            grade: r.Variety || r.Grade || null,
            source: "data_gov_in",
          }));

        if (rows.length > 0) {
          const { error } = await supabase
            .from("mandi_prices")
            .upsert(rows, {
              onConflict: "crop_key,mandi_name,price_date,grade",
              ignoreDuplicates: true,
            });

          if (!error) {
            totalInserted += rows.length;
          }
        }
      } catch (err) {
        console.error(
          `Failed to fetch prices for ${commodity} in ${stateFilter}:`,
          err
        );
      }
    }
  }

  return { cached: 0, fresh: totalInserted };
}

/**
 * Get cached mandi prices from Supabase.
 * If cache is stale (>6 hours), trigger a background refresh.
 */
export async function getCachedPrices(
  supabase: SupabaseClient,
  cropKey: string,
  state?: string,
  district?: string,
  days: number = 14
): Promise<{
  prices: MandiPriceRow[];
  isStale: boolean;
}> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffStr = cutoffDate.toISOString().split("T")[0];

  let query = supabase
    .from("mandi_prices")
    .select("*")
    .eq("crop_key", cropKey)
    .gte("price_date", cutoffStr)
    .order("price_date", { ascending: false })
    .limit(200);

  if (state) query = query.eq("state", state);
  if (district) query = query.eq("district", district);

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch cached prices:", error);
    return { prices: [], isStale: true };
  }

  const prices = (data || []) as MandiPriceRow[];

  // Check if data is stale (latest price older than 6 hours)
  let isStale = true;
  if (prices.length > 0) {
    const latestCreated = new Date(prices[0].created_at);
    const hoursSince =
      (Date.now() - latestCreated.getTime()) / (1000 * 60 * 60);
    isStale = hoursSince > CACHE_HOURS;
  }

  return { prices, isStale };
}

export type MandiPriceRow = {
  id: string;
  crop_key: string;
  mandi_name: string;
  district: string;
  state: string;
  price_per_quintal: number;
  min_price: number | null;
  max_price: number | null;
  price_date: string;
  grade: string | null;
  source: string;
  created_at: string;
};

/**
 * Parse arrival_date from data.gov.in (format: "DD/MM/YYYY" or "YYYY-MM-DD").
 */
function parseArrivalDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().split("T")[0];

  // Try DD/MM/YYYY format
  if (dateStr.includes("/")) {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
  }

  // Already ISO format
  return dateStr.split("T")[0];
}
