import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { autoMigrateUser, regenerateTimeline } from "@/lib/migration/auto-migrate-v2";

export async function POST() {
  try {
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const serviceClient = createServiceClient();

    // Auto-migrate v1 users (create farm + crop if missing)
    const migrateResult = await autoMigrateUser(serviceClient, user.id);

    // Re-generate timelines with three-layer model if old version
    const regenResult = await regenerateTimeline(serviceClient, user.id);

    return Response.json({ ...migrateResult, ...regenResult });
  } catch (error) {
    console.error("Migration error:", error);
    return Response.json(
      { error: "Migration failed" },
      { status: 500 }
    );
  }
}
