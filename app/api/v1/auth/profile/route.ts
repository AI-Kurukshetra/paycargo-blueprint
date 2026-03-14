import { errorResponse, ok } from "@/lib/api/http";
import { getCurrentUserProfile } from "@/lib/auth/session";

export async function GET() {
  try {
    const profile = await getCurrentUserProfile();
    if (!profile) {
      return errorResponse("Not authenticated.", 401);
    }

    return ok({ data: profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch profile.";
    return errorResponse(message, 400);
  }
}
