import type { UserRole } from "@/lib/domain/constants";
import type { TableName } from "@/types/database";

const roleAccess: Record<UserRole, TableName[]> = {
  admin: [
    "organizations",
    "users",
    "organization_memberships",
    "vendors",
    "invoices",
    "payments",
    "shipments",
    "containers",
    "cargo",
    "transactions",
    "documents",
    "audit_logs",
    "exchange_rates",
    "compliance_records",
    "credit_profiles",
    "notifications",
    "disputes",
    "terminals",
    "carriers",
    "routes",
    "fees",
    "contracts",
    "bank_accounts",
    "payment_methods"
  ],
  payer: [
    "vendors",
    "invoices",
    "payments",
    "shipments",
    "containers",
    "documents",
    "notifications",
    "disputes",
    "terminals",
    "carriers",
    "routes",
    "fees",
    "bank_accounts",
    "payment_methods"
  ],
  approver: [
    "vendors",
    "invoices",
    "payments",
    "shipments",
    "containers",
    "documents",
    "notifications",
    "disputes",
    "compliance_records",
    "credit_profiles"
  ],
  vendor: ["invoices", "shipments", "documents", "notifications"],
  viewer: ["invoices", "payments", "shipments", "containers", "documents", "notifications", "disputes"]
};

export function canAccessResource(role: UserRole, resource: TableName): boolean {
  return roleAccess[role].includes(resource);
}

export function canMutateResource(role: UserRole, resource: TableName): boolean {
  if (role === "viewer") {
    return false;
  }

  if (role === "vendor") {
    return resource === "invoices" || resource === "documents";
  }

  return canAccessResource(role, resource);
}
