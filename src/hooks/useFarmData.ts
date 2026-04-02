"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useRef, useState } from "react";
import type {
  Farm,
  FarmCrop,
  FarmActivity,
  CropTemplateStage,
} from "@/types/database";

export type FarmData = {
  farm: Farm | null;
  farmCrop: FarmCrop | null;
  currentStage: CropTemplateStage | null;
  upcomingActivities: FarmActivity[];
  pastActivities: FarmActivity[];
  allActivities: FarmActivity[];
  loading: boolean;
  error: string | null;
  latitude: number | null;
  longitude: number | null;
  refetch: () => void;
};

export function useFarmData(): FarmData {
  const [farm, setFarm] = useState<Farm | null>(null);
  const [farmCrop, setFarmCrop] = useState<FarmCrop | null>(null);
  const [currentStage, setCurrentStage] = useState<CropTemplateStage | null>(null);
  const [upcomingActivities, setUpcomingActivities] = useState<FarmActivity[]>([]);
  const [pastActivities, setPastActivities] = useState<FarmActivity[]>([]);
  const [allActivities, setAllActivities] = useState<FarmActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchCount, setFetchCount] = useState(0);

  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        // Get user's first farm
        const { data: farms } = await supabase
          .from("farms")
          .select("*")
          .eq("user_id", user.id)
          .limit(1);

        const userFarm = farms?.[0] || null;
        setFarm(userFarm);

        if (!userFarm) {
          setLoading(false);
          return;
        }

        // Get active crop on this farm
        const { data: crops } = await supabase
          .from("farm_crops")
          .select("*")
          .eq("farm_id", userFarm.id)
          .eq("status", "active")
          .limit(1);

        const activeCrop = crops?.[0] || null;
        setFarmCrop(activeCrop);

        if (!activeCrop) {
          setLoading(false);
          return;
        }

        // Get all farm activities
        const { data: activities } = await supabase
          .from("farm_activities")
          .select("*")
          .eq("farm_crop_id", activeCrop.id)
          .order("scheduled_date", { ascending: true });

        const allActs = (activities || []) as FarmActivity[];
        setAllActivities(allActs);

        const today = new Date().toISOString().split("T")[0];

        // Split into upcoming (scheduled, today or future) and past
        setUpcomingActivities(
          allActs.filter(
            (a) =>
              a.status === "scheduled" &&
              a.scheduled_date &&
              a.scheduled_date >= today
          )
        );
        setPastActivities(
          allActs.filter(
            (a) =>
              a.status !== "scheduled" ||
              (a.scheduled_date && a.scheduled_date < today)
          )
        );

        // Determine current stage from the nearest scheduled activity's template_stage_id
        const currentActivity = allActs.find(
          (a) =>
            a.template_stage_id &&
            a.scheduled_date &&
            a.scheduled_date >= today &&
            a.status === "scheduled"
        );

        if (currentActivity?.template_stage_id) {
          const { data: stage } = await supabase
            .from("crop_template_stages")
            .select("*")
            .eq("id", currentActivity.template_stage_id)
            .single();

          setCurrentStage(stage as CropTemplateStage | null);
        }
      } catch (err) {
        console.error("useFarmData error:", err);
        setError("Failed to load farm data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchCount]);

  return {
    farm,
    farmCrop,
    currentStage,
    upcomingActivities,
    pastActivities,
    allActivities,
    loading,
    error,
    latitude: farm?.latitude || null,
    longitude: farm?.longitude || null,
    refetch: () => setFetchCount((c) => c + 1),
  };
}
