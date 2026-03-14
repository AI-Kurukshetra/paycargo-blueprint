import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type { Database } from "@/types/database";

type NotificationInsert = Database["public"]["Tables"]["notifications"]["Insert"];

export async function createNotification(input: NotificationInsert) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from("notifications").insert(input).select("*").single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
