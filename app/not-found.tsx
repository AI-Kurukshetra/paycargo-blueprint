import Link from "next/link";

export default function NotFound(): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="surface max-w-xl p-10 text-center">
        <p className="section-title">Not Found</p>
        <h1 className="mt-4 font-[var(--font-serif)] text-5xl text-ink">This route does not exist</h1>
        <p className="mt-3 text-sm text-slate-600">
          The requested resource page is not configured in this workspace.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white"
        >
          Return to dashboard
        </Link>
      </div>
    </div>
  );
}
