import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/lib/auth/session";

export async function getOperationsReport(profile: UserProfile) {
  const supabase = createSupabaseServerClient();

  const [fees, disputes, compliance] = await Promise.all([
    supabase.from("fees").select("fee_type,amount,status").eq("organization_id", profile.organization_id ?? ""),
    supabase.from("disputes").select("status").eq("organization_id", profile.organization_id ?? ""),
    supabase
      .from("compliance_records")
      .select("status,record_type")
      .eq("organization_id", profile.organization_id ?? "")
  ]);

  return {
    openFeeExposure: (fees.data ?? [])
      .filter((item) => item.status === "open")
      .reduce((sum, item) => sum + Number(item.amount), 0),
    paidFeeTotal: (fees.data ?? [])
      .filter((item) => item.status === "paid")
      .reduce((sum, item) => sum + Number(item.amount), 0),
    openDisputes: (disputes.data ?? []).filter((item) => item.status !== "closed").length,
    complianceFailures: (compliance.data ?? []).filter((item) => item.status === "failed").length,
    complianceExpiring: (compliance.data ?? []).filter((item) => item.status === "expired").length
  };
}
