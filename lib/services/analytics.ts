import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/lib/auth/session";

export async function getDashboardAnalytics(profile: UserProfile) {
  const supabase = createSupabaseServerClient();

  const [payments, invoices, vendors, shipments] = await Promise.all([
    supabase
      .from("payments")
      .select("amount,status,processed_at", { count: "exact" })
      .eq("organization_id", profile.organization_id ?? ""),
    supabase
      .from("invoices")
      .select("status,created_at,paid_at", { count: "exact" })
      .eq("organization_id", profile.organization_id ?? ""),
    supabase
      .from("vendors")
      .select("status", { count: "exact" })
      .eq("organization_id", profile.organization_id ?? ""),
    supabase
      .from("shipments")
      .select("status,release_status", { count: "exact" })
      .eq("organization_id", profile.organization_id ?? "")
  ]);

  const paymentRows = payments.data ?? [];
  const invoiceRows = invoices.data ?? [];
  const shipmentRows = shipments.data ?? [];
  const totalPaymentVolume = paymentRows
    .filter((item) => item.status === "paid")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const settledInvoices = invoiceRows.filter((item) => item.paid_at);
  const averageProcessingTimeHours =
    settledInvoices.length > 0
      ? Math.round(
          settledInvoices.reduce((sum, item) => {
            const start = new Date(item.created_at).getTime();
            const end = new Date(item.paid_at ?? item.created_at).getTime();
            return sum + (end - start) / 36e5;
          }, 0) / settledInvoices.length
        )
      : 0;

  return {
    totalPaymentVolume,
    pendingInvoices: invoiceRows.filter((item) => item.status === "pending").length,
    activeVendors: (vendors.data ?? []).filter((item) => item.status === "active").length,
    averageProcessingTimeHours,
    releasedShipments: shipmentRows.filter((item) => item.release_status === "released").length,
    shipmentStatusBreakdown: shipmentRows.reduce<Record<string, number>>((accumulator, item) => {
      accumulator[item.status] = (accumulator[item.status] ?? 0) + 1;
      return accumulator;
    }, {})
  };
}
