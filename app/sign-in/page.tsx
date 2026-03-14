import { Suspense } from "react";
import { AuthPanel } from "@/components/auth/auth-panel";

export default function SignInPage(): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-card lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden bg-ink p-10 text-white lg:block">
          <p className="text-xs uppercase tracking-[0.34em] text-white/60">PayCargo Blueprint</p>
          <h1 className="mt-6 font-[var(--font-serif)] text-5xl leading-tight">
            Control freight payments before they control operations.
          </h1>
          <p className="mt-6 max-w-md text-base text-white/70">
            One workspace for invoice intake, approvals, settlement tracking, cargo release, documents, and compliance.
          </p>
        </div>
        <div className="p-8 sm:p-10">
          <p className="section-title">Authentication</p>
          <h2 className="mt-4 font-[var(--font-serif)] text-4xl text-ink">Access or create your workspace</h2>
          <Suspense fallback={<div className="mt-8 text-sm text-slate-500">Loading authentication form...</div>}>
            <AuthPanel />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
