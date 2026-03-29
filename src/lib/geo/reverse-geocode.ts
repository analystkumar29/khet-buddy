/**
 * Reverse geocode GPS coordinates to nearest district/state.
 * Uses the local districts lookup — no external API needed.
 */

import { findNearestDistrict } from "./districts";

export type GeoResult = {
  district: string;
  district_hi: string;
  state: string;
  state_hi: string;
  lat: number;
  lon: number;
};

/**
 * Given lat/lon, find the nearest known district in North India.
 * Returns null if coordinates are too far from any known district (>200km).
 */
export function reverseGeocode(lat: number, lon: number): GeoResult | null {
  const result = findNearestDistrict(lat, lon);
  if (!result) return null;

  return {
    district: result.district.name,
    district_hi: result.district.name_hi,
    state: result.state.name,
    state_hi: result.state.name_hi,
    lat,
    lon,
  };
}
