import { ResourceWorkspace } from "@/components/resource-workspace";
import { resourceViewConfigs } from "@/lib/domain/resource-views";

export default function SettingsPage(): JSX.Element {
  return (
    <div className="space-y-6">
      <section className="surface p-8">
        <p className="section-title">Settings</p>
        <h1 className="mt-4 font-[var(--font-serif)] text-5xl text-ink">Treasury and payout configuration</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600">
          Configure the stored payment instruments and bank accounts used by the payer organization.
        </p>
      </section>
      <ResourceWorkspace config={resourceViewConfigs["payment-methods"]} />
      <ResourceWorkspace config={resourceViewConfigs["bank-accounts"]} />
    </div>
  );
}
