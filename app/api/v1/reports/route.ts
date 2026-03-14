import { errorResponse, ok } from "@/lib/api/http";
import { requireUserProfile } from "@/lib/auth/session";
import { getOperationsReport } from "@/lib/services/reports";

export async function GET() {
  try {
    const profile = await requireUserProfile();
    const data = await getOperationsReport(profile);
    return ok({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch report.";
    return errorResponse(message, 400);
  }
}
