"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { primaryNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/lib/auth/session";

export function AppShell({
  children,
  profile
}: {
  children: ReactNode;
  profile: UserProfile;
}): JSX.Element {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/v1/auth/sign-out", { method: "POST" });
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-6 lg:px-8">
        <aside className="surface sticky top-6 hidden h-[calc(100vh-3rem)] w-72 overflow-hidden p-5 lg:flex lg:flex-col">
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="rounded-2xl bg-ink px-5 py-6 text-white">
              <p className="text-xs uppercase tracking-[0.3em] text-white/70">PayCargo Blueprint</p>
              <h1 className="mt-3 font-[var(--font-serif)] text-3xl">Freight cashflow control</h1>
              <p className="mt-3 text-sm text-white/70">
                Multi-modal invoice, payment, release, and compliance operations.
              </p>
            </div>
            <nav className="mt-6 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
              {primaryNavigation.map((item) => {
                const Icon = item.icon;
                const active = pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                      active ? "bg-ink text-white" : "text-slate-600 hover:bg-slate-100 hover:text-ink"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/reports"
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                  pathname.startsWith("/reports")
                    ? "bg-ink text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-ink"
                )}
              >
                Reports
              </Link>
            </nav>
          </div>
          <div className="mt-4 shrink-0 rounded-2xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-ink">{profile.full_name}</p>
            <p className="text-sm text-slate-500">{profile.email}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.24em] text-tide">{profile.role}</p>
            <button
              type="button"
              onClick={handleSignOut}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-ink"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <div className="surface mb-4 p-4 lg:hidden">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-ink">{profile.full_name}</p>
                <p className="text-xs uppercase tracking-[0.24em] text-tide">{profile.role}</p>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600"
              >
                Sign out
              </button>
            </div>
            <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {primaryNavigation.map((item) => {
                const active = pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition",
                      active ? "bg-ink text-white" : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/reports"
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition",
                  pathname.startsWith("/reports") ? "bg-ink text-white" : "bg-slate-100 text-slate-600"
                )}
              >
                Reports
              </Link>
            </nav>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
