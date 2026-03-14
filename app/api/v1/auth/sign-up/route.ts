import { randomUUID } from "node:crypto";
import { z } from "zod";
import { created, errorResponse } from "@/lib/api/http";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

const signUpSchema = z.object({
  organizationName: z.string().min(2),
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export async function POST(request: Request) {
  try {
    const payload = signUpSchema.parse((await request.json()) as unknown);
    const supabase = createSupabaseServiceClient();

    const baseSlug = slugify(payload.organizationName);
    const organizationSlug = `${baseSlug || "organization"}-${randomUUID().slice(0, 8)}`;

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: payload.email,
      password: payload.password,
      email_confirm: true,
      user_metadata: {
        full_name: payload.fullName
      }
    });

    if (authError || !authData.user) {
      return errorResponse(authError?.message ?? "Failed to create user account.", 400);
    }

    const { data: organization, error: organizationError } = await supabase
      .from("organizations")
      .insert({
        name: payload.organizationName,
        slug: organizationSlug,
        type: "shipper",
        base_currency: "USD",
        timezone: "UTC",
        status: "active",
        metadata: {}
      })
      .select("id, name, slug")
      .single();

    if (organizationError || !organization) {
      return errorResponse(organizationError?.message ?? "Failed to create organization.", 400);
    }

    const { error: profileError } = await supabase.from("users").upsert(
      {
        id: authData.user.id,
        organization_id: organization.id,
        email: payload.email,
        full_name: payload.fullName,
        role: "admin",
        status: "active"
      },
      {
        onConflict: "id"
      }
    );

    if (profileError) {
      return errorResponse(profileError.message, 400);
    }

    const { error: membershipError } = await supabase.from("organization_memberships").upsert(
      {
        organization_id: organization.id,
        user_id: authData.user.id,
        role: "admin",
        is_primary: true
      },
      {
        onConflict: "organization_id,user_id"
      }
    );

    if (membershipError) {
      return errorResponse(membershipError.message, 400);
    }

    await supabase.from("notifications").insert({
      organization_id: organization.id,
      user_id: authData.user.id,
      type: "system",
      title: "Workspace ready",
      message: `Organization ${organization.name} is ready for invoice and payment operations.`,
      status: "unread",
      channel: "in_app",
      entity_type: "organizations",
      entity_id: organization.id
    });

    return created({
      data: {
        userId: authData.user.id,
        organizationId: organization.id,
        organizationSlug: organization.slug
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues.map((issue) => issue.message).join(", "), 400);
    }

    return errorResponse(error instanceof Error ? error.message : "Sign-up failed.", 400);
  }
}
