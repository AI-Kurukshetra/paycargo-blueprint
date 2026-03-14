import { MetricCard } from "@/components/metric-card";
import { requireUserProfile } from "@/lib/auth/session";
import { getOperationsReport } from "@/lib/services/reports";
import { formatCurrency } from "@/lib/utils";

export default async function ReportsPage(): Promise<JSX.Element> {
  const profile = await requireUserProfile();
  const report = await getOperationsReport(profile);

  return (
    <div className="space-y-6">
      <section className="surface p-8">
        <p className="section-title">Reports</p>
        <h1 className="mt-4 font-[var(--font-serif)] text-5xl text-ink">Operations exposure and controls</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600">
          Monitor fee exposure, dispute backlog, and compliance posture with direct aggregations from the transactional tables.
        </p>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Open Fee Exposure"
          value={formatCurrency(report.openFeeExposure)}
          detail="Demurrage, detention, and service fees still outstanding."
        />
        <MetricCard
          label="Paid Fees"
          value={formatCurrency(report.paidFeeTotal)}
          detail="Fees settled through invoice-linked or standalone payments."
        />
        <MetricCard
          label="Open Disputes"
          value={String(report.openDisputes)}
          detail="Disputes needing investigation or final resolution."
        />
        <MetricCard
          label="Compliance Failures"
          value={String(report.complianceFailures)}
          detail="Records currently blocked due to failed checks."
        />
        <MetricCard
          label="Expired Compliance"
          value={String(report.complianceExpiring)}
          detail="Records requiring renewal or operational review."
        />
      </section>
    </div>
  );
}
