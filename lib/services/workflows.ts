import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { createNotification } from "@/lib/services/notifications";
import type { Database, Json } from "@/types/database";

type PaymentUpdate = Database["public"]["Tables"]["payments"]["Update"];
type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];
type InvoiceReleaseRow = Pick<
  Database["public"]["Tables"]["invoices"]["Row"],
  "id" | "invoice_number" | "shipment_id"
>;
type ShipmentReleaseRow = Pick<Database["public"]["Tables"]["shipments"]["Row"], "id" | "shipment_number">;

export function calculateFraudScore(amount: number, currency: string, riskRating: string | null): number {
  const amountFactor = Math.min(amount / 25000, 1) * 45;
  const currencyFactor = currency === "USD" ? 10 : 18;
  const riskFactor = riskRating === "high" ? 32 : riskRating === "medium" ? 18 : 8;
  return Math.round(Math.min(amountFactor + currencyFactor + riskFactor, 100));
}

export async function handlePaymentWorkflow(paymentId: string, updates: PaymentUpdate) {
  const supabase = createSupabaseServiceClient();

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .update(updates)
    .eq("id", paymentId)
    .select("*")
    .single();

  const paymentRow = payment as PaymentRow | null;

  if (paymentError || !paymentRow) {
    throw new Error(paymentError?.message ?? "Payment update failed");
  }

  if (updates.status === "paid") {
    const processedAt = updates.processed_at ?? new Date().toISOString();
    const { data: invoice } = await supabase
      .from("invoices")
      .select("id, invoice_number, shipment_id")
      .eq("id", paymentRow.invoice_id)
      .single();
    const invoiceRow = invoice as InvoiceReleaseRow | null;
    const { data: shipment } =
      invoiceRow?.shipment_id
        ? await supabase
            .from("shipments")
            .select("id, shipment_number")
            .eq("id", invoiceRow.shipment_id)
            .single()
        : { data: null };
    const shipmentRow = shipment as ShipmentReleaseRow | null;

    await supabase
      .from("payments")
      .update({ release_triggered_at: processedAt })
      .eq("id", paymentId);

    if (invoiceRow) {
      await createNotification({
        organization_id: paymentRow.organization_id,
        user_id: paymentRow.approved_by ?? paymentRow.initiated_by,
        type: "payment",
        title: `Payment settled for ${invoiceRow.invoice_number}`,
        message: shipmentRow
          ? `Shipment ${shipmentRow.shipment_number} is now released.`
          : `Invoice ${invoiceRow.invoice_number} has been marked paid.`,
        entity_type: "payments",
        entity_id: paymentRow.id
      });
    }

    await supabase.from("transactions").insert({
      payment_id: paymentRow.id,
      invoice_id: paymentRow.invoice_id,
      transaction_type: "release",
      amount: paymentRow.amount,
      currency: paymentRow.currency,
      status: "posted",
      metadata: {
        workflow: "cargo_release",
        released_at: processedAt
      } as Json
    });
  }

  await supabase.from("audit_logs").insert({
    organization_id: paymentRow.organization_id,
    user_id: paymentRow.approved_by ?? paymentRow.initiated_by,
    entity_type: "payments",
    entity_id: paymentRow.id,
    action: "payment.updated",
    after_data: updates as Json
  });

  return paymentRow;
}
