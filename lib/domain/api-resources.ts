import type { TableName } from "@/types/database";

export const apiResourceMap = {
  users: "users",
  organizations: "organizations",
  vendors: "vendors",
  invoices: "invoices",
  payments: "payments",
  shipments: "shipments",
  containers: "containers",
  documents: "documents",
  notifications: "notifications",
  compliance: "compliance_records",
  disputes: "disputes",
  terminals: "terminals",
  carriers: "carriers",
  routes: "routes",
  fees: "fees",
  contracts: "contracts",
  "bank-accounts": "bank_accounts",
  "payment-methods": "payment_methods",
  cargo: "cargo",
  transactions: "transactions",
  "exchange-rates": "exchange_rates",
  "credit-profiles": "credit_profiles"
} as const satisfies Record<string, TableName>;

export type ApiResourceName = keyof typeof apiResourceMap;

export function resolveApiResource(resource: string): TableName | null {
  if (resource in apiResourceMap) {
    return apiResourceMap[resource as ApiResourceName];
  }

  return null;
}
