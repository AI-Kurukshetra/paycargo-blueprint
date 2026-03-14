import { errorResponse, ok } from "@/lib/api/http";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    return ok({
      received: true,
      event: payload.event ?? "unknown",
      message: "Webhook endpoint scaffolded for settlement, carrier, or terminal integrations."
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid webhook payload.";
    return errorResponse(message, 400);
  }
}
