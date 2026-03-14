import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type { Database } from "@/types/database";

export type UserProfile = Database["public"]["Tables"]["users"]["Row"];
type OrganizationMembership = Database["public"]["Tables"]["organization_memberships"]["Row"];

export async function getCurrentSession() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  return session;
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const serviceClient = createSupabaseServiceClient();

  const { data: membership } = await serviceClient
    .from("organization_memberships")
    .select("*")
    .eq("user_id", user.id)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const primaryMembership = membership as OrganizationMembership | null;
  const metadataName =
    typeof user.user_metadata.full_name === "string" && user.user_metadata.full_name.trim().length > 0
      ? user.user_metadata.full_name.trim()
      : null;
  const emailLocalPart = user.email?.split("@")[0]?.trim();
  const fullName = metadataName ?? (emailLocalPart && emailLocalPart.length > 0 ? emailLocalPart : "User");

  const baseProfile = {
    id: user.id,
    email: user.email ?? "",
    full_name: fullName,
    role: primaryMembership?.role ?? "admin",
    status: "active" as const,
    organization_id: primaryMembership?.organization_id ?? null,
    last_sign_in_at: new Date().toISOString()
  };

  const { data: profile, error } = await serviceClient
    .from("users")
    .upsert(baseProfile, { onConflict: "id" })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return profile as UserProfile;
}

export async function requireUserProfile(): Promise<UserProfile> {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/sign-in");
  }

  return profile;
}
