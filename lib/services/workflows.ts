import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { createNotification } from "@/lib/services/notifications";
import type { Database } from "@/types/database";

type PaymentUpdate = Database["public"]["Tables"]["payments"]["Update"];

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

  if (paymentError || !payment) {
    throw new Error(paymentError?.message ?? "Payment update failed");
  }

  if (updates.status === "paid") {
    const processedAt = updates.processed_at ?? new Date().toISOString();
    const { data: invoice } = await supabase
      .from("invoices")
      .select("id, invoice_number, shipment_id")
      .eq("id", payment.invoice_id)
      .single();
    const { data: shipment } =
      invoice?.shipment_id
        ? await supabase
            .from("shipments")
            .select("id, shipment_number")
            .eq("id", invoice.shipment_id)
            .single()
        : { data: null };

    await supabase
      .from("payments")
      .update({ release_triggered_at: processedAt })
      .eq("id", paymentId);

    if (invoice) {
      await createNotification({
        organization_id: payment.organization_id,
        user_id: payment.approved_by ?? payment.initiated_by,
        type: "payment",
        title: `Payment settled for ${invoice.invoice_number}`,
        message: shipment
          ? `Shipment ${shipment.shipment_number} is now released.`
          : `Invoice ${invoice.invoice_number} has been marked paid.`,
        entity_type: "payments",
        entity_id: payment.id
      });
    }

    await supabase.from("transactions").insert({
      payment_id: payment.id,
      invoice_id: payment.invoice_id,
      transaction_type: "release",
      amount: payment.amount,
      currency: payment.currency,
      status: "posted",
      metadata: {
        workflow: "cargo_release",
        released_at: processedAt
      }
    });
  }

  await supabase.from("audit_logs").insert({
    organization_id: payment.organization_id,
    user_id: payment.approved_by ?? payment.initiated_by,
    entity_type: "payments",
    entity_id: payment.id,
    action: "payment.updated",
    after_data: updates
  });

  return payment;
}
