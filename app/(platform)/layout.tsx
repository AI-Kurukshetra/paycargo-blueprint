import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { requireUserProfile } from "@/lib/auth/session";

export default async function PlatformLayout({
  children
}: Readonly<{ children: ReactNode }>): Promise<JSX.Element> {
  const profile = await requireUserProfile();

  return <AppShell profile={profile}>{children}</AppShell>;
}
