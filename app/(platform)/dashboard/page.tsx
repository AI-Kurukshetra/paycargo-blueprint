import { MetricCard } from "@/components/metric-card";
import { StatusBadge } from "@/components/status-badge";
import { requireUserProfile } from "@/lib/auth/session";
import { getDashboardAnalytics } from "@/lib/services/analytics";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage(): Promise<JSX.Element> {
  const profile = await requireUserProfile();
  const analytics = await getDashboardAnalytics(profile);
  const supabase = createSupabaseServerClient();

  const [recentInvoices, recentNotifications] = await Promise.all([
    supabase
      .from("invoices")
      .select("id, invoice_number, total_amount, status, approval_status")
      .eq("organization_id", profile.organization_id ?? "")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("notifications")
      .select("id, title, message, status, created_at")
      .eq("organization_id", profile.organization_id ?? "")
      .order("created_at", { ascending: false })
      .limit(5)
  ]);

  const invoiceRows = (recentInvoices.data ?? []) as Array<
    Pick<
      Database["public"]["Tables"]["invoices"]["Row"],
      "id" | "invoice_number" | "total_amount" | "status" | "approval_status"
    >
  >;
  const notificationRows = (recentNotifications.data ?? []) as Array<
    Pick<
      Database["public"]["Tables"]["notifications"]["Row"],
      "id" | "title" | "message" | "status" | "created_at"
    >
  >;

  return (
    <div className="space-y-6">
      <section className="surface overflow-hidden p-8">
        <p className="section-title">Operations Command Center</p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-[var(--font-serif)] text-5xl text-ink">Freight cashflow at a glance</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600">
              Track payment throughput, release automation, invoice queues, and vendor network health in one operating dashboard.
            </p>
          </div>
          <div className="rounded-2xl bg-ink px-5 py-4 text-white">
            <p className="text-xs uppercase tracking-[0.28em] text-white/60">Org role</p>
            <p className="mt-2 text-lg font-semibold capitalize">{profile.role}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Payment Volume"
          value={formatCurrency(analytics.totalPaymentVolume)}
          detail="Settled payment volume across processed invoices."
        />
        <MetricCard
          label="Pending Invoices"
          value={String(analytics.pendingInvoices)}
          detail="Invoices still waiting for payer review or approval."
        />
        <MetricCard
          label="Active Vendors"
          value={String(analytics.activeVendors)}
          detail="Approved network participants able to submit charges."
        />
        <MetricCard
          label="Processing Time"
          value={`${analytics.averageProcessingTimeHours}h`}
          detail="Average time from invoice creation to paid settlement."
        />
        <MetricCard
          label="Released Shipments"
          value={String(analytics.releasedShipments)}
          detail="Shipments released automatically after paid settlement."
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="surface overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-5">
            <p className="section-title">Recent Invoices</p>
          </div>
          <div className="divide-y divide-slate-100">
            {invoiceRows.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div>
                  <p className="font-medium text-ink">{invoice.invoice_number}</p>
                  <p className="text-sm text-slate-500">{formatCurrency(Number(invoice.total_amount))}</p>
                </div>
                <div className="flex gap-2">
                  <StatusBadge value={invoice.status} />
                  <StatusBadge value={invoice.approval_status} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="surface overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-5">
            <p className="section-title">Workflow Notices</p>
          </div>
          <div className="divide-y divide-slate-100">
            {notificationRows.map((notification) => (
              <div key={notification.id} className="px-6 py-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium text-ink">{notification.title}</p>
                  <StatusBadge value={notification.status} />
                </div>
                <p className="mt-2 text-sm text-slate-500">{notification.message}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
