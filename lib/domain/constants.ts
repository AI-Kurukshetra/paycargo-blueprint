import type { TableName } from "@/types/database";

export const userRoles = ["admin", "payer", "vendor", "approver", "viewer"] as const;
export type UserRole = (typeof userRoles)[number];

export type ResourceConfig = {
  key: TableName;
  label: string;
  path: string;
  description: string;
  roles: UserRole[];
};

export const resourceConfigs: ResourceConfig[] = [
  {
    key: "users",
    label: "Users",
    path: "/users",
    description: "Manage platform users and role assignments.",
    roles: ["admin"]
  },
  {
    key: "organizations",
    label: "Organizations",
    path: "/organizations",
    description: "Configure legal entities, currencies, and operating regions.",
    roles: ["admin"]
  },
  {
    key: "vendors",
    label: "Vendors",
    path: "/vendors",
    description: "Onboard carriers, terminals, forwarders, and payment partners.",
    roles: ["admin", "payer", "approver"]
  },
  {
    key: "invoices",
    label: "Invoices",
    path: "/invoices",
    description: "Review, approve, and pay freight invoices.",
    roles: ["admin", "payer", "approver", "vendor", "viewer"]
  },
  {
    key: "payments",
    label: "Payments",
    path: "/payments",
    description: "Control the payment lifecycle and release workflows.",
    roles: ["admin", "payer", "approver", "viewer"]
  },
  {
    key: "shipments",
    label: "Shipments",
    path: "/shipments",
    description: "Track release readiness, milestones, and carrier visibility.",
    roles: ["admin", "payer", "approver", "vendor", "viewer"]
  },
  {
    key: "containers",
    label: "Containers",
    path: "/containers",
    description: "Monitor container charges and release codes.",
    roles: ["admin", "payer", "approver", "viewer"]
  },
  {
    key: "documents",
    label: "Documents",
    path: "/documents",
    description: "Store invoices, bills of lading, receipts, and supporting files.",
    roles: ["admin", "payer", "approver", "vendor", "viewer"]
  },
  {
    key: "notifications",
    label: "Notifications",
    path: "/notifications",
    description: "View operational alerts and workflow notices.",
    roles: ["admin", "payer", "approver", "vendor", "viewer"]
  },
  {
    key: "compliance_records",
    label: "Compliance",
    path: "/compliance",
    description: "Track KYC, sanctions, and insurance posture.",
    roles: ["admin", "approver"]
  },
  {
    key: "disputes",
    label: "Disputes",
    path: "/disputes",
    description: "Resolve invoice and settlement issues.",
    roles: ["admin", "payer", "approver", "viewer"]
  },
  {
    key: "terminals",
    label: "Terminals",
    path: "/terminals",
    description: "Maintain terminal network data used by release automation.",
    roles: ["admin", "payer"]
  },
  {
    key: "carriers",
    label: "Carriers",
    path: "/carriers",
    description: "Configure carrier master data and route availability.",
    roles: ["admin", "payer"]
  }
];
