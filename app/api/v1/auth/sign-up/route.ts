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

const MISSING_PUBLIC_SCHEMA_PERMISSION = "permission denied for schema public";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

async function cleanupFailedSignUp(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  userId: string,
  organizationId?: string
) {
  if (organizationId) {
    await supabase.from("organizations").delete().eq("id", organizationId);
  }

  await supabase.auth.admin.deleteUser(userId);
}

function mapSignUpError(message: string | undefined, fallbackMessage: string): { message: string; status: number } {
  if (!message) {
    return {
      message: fallbackMessage,
      status: 400
    };
  }

  if (message.toLowerCase().includes(MISSING_PUBLIC_SCHEMA_PERMISSION)) {
    return {
      message:
        "Database permissions are out of date. Apply the latest Supabase migrations, including the public schema grant fixes, then try signing up again.",
      status: 500
    };
  }

  return {
    message,
    status: 400
  };
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
      const failure = mapSignUpError(authError?.message, "Failed to create user account.");
      return errorResponse(failure.message, failure.status);
    }

    const createdUserId = authData.user.id;

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
      await cleanupFailedSignUp(supabase, createdUserId);
      const failure = mapSignUpError(organizationError?.message, "Failed to create organization.");
      return errorResponse(failure.message, failure.status);
    }

    const { error: profileError } = await supabase.from("users").upsert(
      {
        id: createdUserId,
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
      await cleanupFailedSignUp(supabase, createdUserId, organization.id);
      const failure = mapSignUpError(profileError.message, "Failed to create user profile.");
      return errorResponse(failure.message, failure.status);
    }

    const { error: membershipError } = await supabase.from("organization_memberships").upsert(
      {
        organization_id: organization.id,
        user_id: createdUserId,
        role: "admin",
        is_primary: true
      },
      {
        onConflict: "organization_id,user_id"
      }
    );

    if (membershipError) {
      await cleanupFailedSignUp(supabase, createdUserId, organization.id);
      const failure = mapSignUpError(membershipError.message, "Failed to create organization membership.");
      return errorResponse(failure.message, failure.status);
    }

    await supabase.from("notifications").insert({
      organization_id: organization.id,
      user_id: createdUserId,
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
        userId: createdUserId,
        organizationId: organization.id,
        organizationSlug: organization.slug
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues.map((issue) => issue.message).join(", "), 400);
    }

    const failure = mapSignUpError(error instanceof Error ? error.message : undefined, "Sign-up failed.");
    return errorResponse(failure.message, failure.status);
  }
}
