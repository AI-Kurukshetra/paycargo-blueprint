import { type NextRequest } from "next/server";
import { errorResponse, created, ok, parseListParams } from "@/lib/api/http";
import { resolveApiResource } from "@/lib/domain/api-resources";
import { requireUserProfile } from "@/lib/auth/session";
import { createResource, listResource } from "@/lib/services/resources";

export async function GET(
  request: NextRequest,
  context: { params: { resource: string } }
) {
  const resource = resolveApiResource(context.params.resource);
  if (!resource) {
    return errorResponse("Unknown resource.", 404);
  }

  try {
    const profile = await requireUserProfile();
    const { search } = parseListParams(request);
    const data = await listResource(resource, profile, search);
    return ok({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch resource.";
    return errorResponse(message, 400);
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { resource: string } }
) {
  const resource = resolveApiResource(context.params.resource);
  if (!resource) {
    return errorResponse("Unknown resource.", 404);
  }

  try {
    const profile = await requireUserProfile();
    const payload = (await request.json()) as Record<string, unknown>;
    const data = await createResource(resource, payload, profile);
    return created({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create resource.";
    return errorResponse(message, 400);
  }
}
