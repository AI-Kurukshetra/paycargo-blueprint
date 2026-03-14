import { errorResponse, ok } from "@/lib/api/http";
import { requireUserProfile } from "@/lib/auth/session";
import { getDashboardAnalytics } from "@/lib/services/analytics";

export async function GET() {
  try {
    const profile = await requireUserProfile();
    const data = await getDashboardAnalytics(profile);
    return ok({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch analytics.";
    return errorResponse(message, 400);
  }
}
