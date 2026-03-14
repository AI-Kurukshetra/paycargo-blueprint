import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type UserProfile = Database["public"]["Tables"]["users"]["Row"];

export async function getCurrentSession() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  return session;
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const session = await getCurrentSession();

  if (!session?.user) {
    return null;
  }

  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("users").select("*").eq("id", session.user.id).maybeSingle();
  return data;
}

export async function requireUserProfile(): Promise<UserProfile> {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/sign-in");
  }

  return profile;
}
