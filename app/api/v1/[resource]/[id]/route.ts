import { type NextRequest } from "next/server";
import { errorResponse, noContent, ok } from "@/lib/api/http";
import { resolveApiResource } from "@/lib/domain/api-resources";
import { requireUserProfile } from "@/lib/auth/session";
import { deleteResource, getResource, updateResource } from "@/lib/services/resources";

export async function GET(
  _request: NextRequest,
  context: { params: { resource: string; id: string } }
) {
  const resource = resolveApiResource(context.params.resource);
  if (!resource) {
    return errorResponse("Unknown resource.", 404);
  }

  try {
    const profile = await requireUserProfile();
    const data = await getResource(resource, context.params.id, profile);
    return ok({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch resource.";
    return errorResponse(message, 400);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: { resource: string; id: string } }
) {
  const resource = resolveApiResource(context.params.resource);
  if (!resource) {
    return errorResponse("Unknown resource.", 404);
  }

  try {
    const profile = await requireUserProfile();
    const payload = (await request.json()) as Record<string, unknown>;
    const data = await updateResource(resource, context.params.id, payload, profile);
    return ok({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update resource.";
    return errorResponse(message, 400);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: { resource: string; id: string } }
) {
  const resource = resolveApiResource(context.params.resource);
  if (!resource) {
    return errorResponse("Unknown resource.", 404);
  }

  try {
    const profile = await requireUserProfile();
    await deleteResource(resource, context.params.id, profile);
    return noContent();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete resource.";
    return errorResponse(message, 400);
  }
}
