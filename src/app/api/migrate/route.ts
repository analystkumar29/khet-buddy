import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { autoMigrateUser } from "@/lib/migration/auto-migrate-v2";

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
    const result = await autoMigrateUser(serviceClient, user.id);

    return Response.json(result);
  } catch (error) {
    console.error("Migration error:", error);
    return Response.json(
      { error: "Migration failed" },
      { status: 500 }
    );
  }
}
