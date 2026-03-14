import { ZodError, type ZodSchema } from "zod";
import { canAccessResource, canMutateResource } from "@/lib/auth/permissions";
import type { UserProfile } from "@/lib/auth/session";
import {
  bankAccountSchema,
  carrierSchema,
  cargoSchema,
  complianceSchema,
  contractSchema,
  creditProfileSchema,
  containerSchema,
  disputeSchema,
  documentSchema,
  exchangeRateSchema,
  feeSchema,
  invoiceSchema,
  notificationSchema,
  organizationSchema,
  paymentSchema,
  paymentMethodSchema,
  routeSchema,
  shipmentSchema,
  terminalSchema,
  transactionSchema,
  userSchema,
  vendorSchema
} from "@/lib/domain/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { calculateFraudScore, handlePaymentWorkflow } from "@/lib/services/workflows";
import type { Database, Json, TableName } from "@/types/database";

type SchemaMap = {
  [Key in TableName]?: ZodSchema<unknown>;
};

type TableRow<T extends TableName> = Database["public"]["Tables"][T]["Row"];

const schemaMap: SchemaMap = {
  organizations: organizationSchema,
  users: userSchema,
  vendors: vendorSchema,
  invoices: invoiceSchema,
  payments: paymentSchema,
  shipments: shipmentSchema,
  containers: containerSchema,
  documents: documentSchema,
  notifications: notificationSchema,
  compliance_records: complianceSchema,
  disputes: disputeSchema,
  terminals: terminalSchema,
  carriers: carrierSchema,
  routes: routeSchema,
  fees: feeSchema,
  contracts: contractSchema,
  bank_accounts: bankAccountSchema,
  payment_methods: paymentMethodSchema,
  cargo: cargoSchema,
  transactions: transactionSchema,
  exchange_rates: exchangeRateSchema,
  credit_profiles: creditProfileSchema
};

const orgScopedTables = new Set<TableName>([
  "vendors",
  "invoices",
  "payments",
  "shipments",
  "documents",
  "notifications",
  "compliance_records",
  "disputes",
  "terminals",
  "carriers",
  "routes",
  "fees",
  "contracts",
  "bank_accounts",
  "payment_methods",
  "exchange_rates",
  "credit_profiles",
  "users"
]);

const searchFields: Partial<Record<TableName, string[]>> = {
  organizations: ["name", "slug"],
  users: ["full_name", "email"],
  vendors: ["legal_name", "vendor_code", "contact_email"],
  invoices: ["invoice_number", "notes"],
  payments: ["settlement_reference"],
  shipments: ["shipment_number", "origin_port", "destination_port"],
  containers: ["container_number"],
  documents: ["name", "document_type"],
  notifications: ["title", "message"],
  compliance_records: ["record_type"],
  disputes: ["reason"],
  terminals: ["code", "name", "location"],
  carriers: ["scac", "name"],
  routes: ["route_code", "origin", "destination"],
  fees: ["description", "fee_type"],
  contracts: ["contract_number"],
  bank_accounts: ["bank_name", "account_last4"],
  payment_methods: ["provider", "brand"]
};

function getSchema(resource: TableName): ZodSchema<unknown> | null {
  return schemaMap[resource] ?? null;
}

function normalizePayload(resource: TableName, payload: Record<string, unknown>, profile: UserProfile) {
  if (resource === "organizations" || !orgScopedTables.has(resource)) {
    return payload;
  }

  return {
    organization_id: profile.organization_id,
    ...payload
  };
}

export async function listResource(resource: TableName, profile: UserProfile, search?: string | null) {
  if (!canAccessResource(profile.role, resource)) {
    throw new Error("You do not have access to this resource.");
  }

  const supabase = createSupabaseServerClient();

  if (resource === "containers") {
    let query = supabase
      .from("containers")
      .select("*, shipments!inner(organization_id, shipment_number, status)");

    if (profile.organization_id) {
      query = query.eq("shipments.organization_id", profile.organization_id);
    }

    if (search) {
      query = query.ilike("container_number", `%${search}%`);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  const typedSupabase = supabase.from(resource).select("*").order("created_at", { ascending: false });
  const scopedQuery =
    orgScopedTables.has(resource) && profile.organization_id
      ? typedSupabase.eq("organization_id", profile.organization_id)
      : typedSupabase;

  const fields = searchFields[resource];
  const query =
    search && fields && fields.length > 0
      ? scopedQuery.or(fields.map((field) => `${field}.ilike.%${search}%`).join(","))
      : scopedQuery;

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getResource(resource: TableName, id: string, profile: UserProfile) {
  if (!canAccessResource(profile.role, resource)) {
    throw new Error("You do not have access to this resource.");
  }

  const supabase = createSupabaseServerClient();

  if (resource === "containers") {
    const { data, error } = await supabase
      .from("containers")
      .select("*, shipments!inner(organization_id, shipment_number, status)")
      .eq("id", id)
      .eq("shipments.organization_id", profile.organization_id ?? "")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  let query = supabase.from(resource).select("*").eq("id", id);
  if (orgScopedTables.has(resource) && profile.organization_id) {
    query = query.eq("organization_id", profile.organization_id);
  }

  const { data, error } = await query.single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createResource(
  resource: TableName,
  payload: Record<string, unknown>,
  profile: UserProfile
) {
  if (!canMutateResource(profile.role, resource)) {
    throw new Error("You do not have permission to create this resource.");
  }

  const schema = getSchema(resource);
  if (!schema) {
    throw new Error(`Creation is not configured for ${resource}.`);
  }

  try {
    const parsed = schema.parse(payload) as Record<string, unknown>;
    const normalizedPayload = normalizePayload(resource, parsed, profile);
    const supabase = createSupabaseServiceClient();

    if (resource === "invoices") {
      const vendorId = String(parsed.vendor_id);
      const { data: vendor } = await supabase
        .from("vendors")
        .select("risk_rating")
        .eq("id", vendorId)
        .single();

      normalizedPayload.fraud_score = calculateFraudScore(
        Number(parsed.total_amount ?? 0),
        String(parsed.currency ?? "USD"),
        vendor?.risk_rating ?? null
      );
    }

    const { data, error } = await supabase
      .from(resource)
      .insert(normalizedPayload as never)
      .select("*")
      .single();

    const createdRow = data as TableRow<typeof resource> | null;

    if (error || !createdRow) {
      throw new Error(error?.message ?? `Failed to create ${resource}.`);
    }

    await supabase.from("audit_logs").insert({
      organization_id: profile.organization_id,
      user_id: profile.id,
      entity_type: resource,
      entity_id: createdRow.id,
      action: `${resource}.created`,
      after_data: normalizedPayload as Json
    });

    return createdRow;
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(error.issues.map((issue) => issue.message).join(", "));
    }

    throw error;
  }
}

export async function updateResource(
  resource: TableName,
  id: string,
  payload: Record<string, unknown>,
  profile: UserProfile
) {
  if (!canMutateResource(profile.role, resource)) {
    throw new Error("You do not have permission to update this resource.");
  }

  if (resource === "payments") {
    return handlePaymentWorkflow(id, payload as Database["public"]["Tables"]["payments"]["Update"]);
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from(resource)
    .update(payload as never)
    .eq("id", id)
    .select("*")
    .single();

  const updatedRow = data as TableRow<typeof resource> | null;

  if (error || !updatedRow) {
    throw new Error(error?.message ?? `Failed to update ${resource}.`);
  }

  await supabase.from("audit_logs").insert({
    organization_id: profile.organization_id,
    user_id: profile.id,
    entity_type: resource,
    entity_id: id,
    action: `${resource}.updated`,
    after_data: payload as Json
  });

  return updatedRow;
}

export async function deleteResource(resource: TableName, id: string, profile: UserProfile) {
  if (!canMutateResource(profile.role, resource)) {
    throw new Error("You do not have permission to delete this resource.");
  }

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from(resource).delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  await supabase.from("audit_logs").insert({
    organization_id: profile.organization_id,
    user_id: profile.id,
    entity_type: resource,
    entity_id: id,
    action: `${resource}.deleted`
  });
}
