import { errorResponse, ok } from "@/lib/api/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = createSupabaseServerClient();
    await supabase.auth.signOut();
    return ok({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to sign out.";
    return errorResponse(message, 400);
  }
}
