import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check user's preferred language to route to correct interface
  const { data: profile } = await supabase
    .from("profiles")
    .select("preferred_language")
    .eq("id", user.id)
    .single();

  if (profile?.preferred_language === "en") {
    redirect("/dashboard");
  }

  // Default: Hindi farmer interface — redirects to (farmer) group
  redirect("/home");
}
