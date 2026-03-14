import { z } from "zod";

export const organizationSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  type: z.enum(["shipper", "broker", "carrier", "terminal", "financial_partner"]).default("shipper"),
  base_currency: z.string().length(3).default("USD"),
  timezone: z.string().default("UTC"),
  status: z.enum(["active", "pending", "suspended"]).default("active"),
  metadata: z.record(z.unknown()).default({})
});

export const userSchema = z.object({
  email: z.string().email(),
  full_name: z.string().min(2),
  role: z.enum(["admin", "payer", "vendor", "approver", "viewer"]).default("viewer"),
  phone: z.string().nullish(),
  job_title: z.string().nullish(),
  status: z.enum(["invited", "active", "disabled"]).default("invited")
});

export const vendorSchema = z.object({
  vendor_code: z.string().min(2),
  legal_name: z.string().min(2),
  vendor_type: z.enum(["carrier", "terminal", "logistics_vendor", "freight_forwarder"]),
  contact_name: z.string().nullish(),
  contact_email: z.string().email().nullish(),
  contact_phone: z.string().nullish(),
  status: z.enum(["onboarding", "active", "blocked"]).default("onboarding"),
  risk_rating: z.enum(["low", "medium", "high"]).default("medium"),
  payment_terms_days: z.number().int().min(0).default(15),
  metadata: z.record(z.unknown()).default({})
});

export const invoiceSchema = z.object({
  vendor_id: z.string().uuid(),
  shipment_id: z.string().uuid().nullish(),
  container_id: z.string().uuid().nullish(),
  invoice_number: z.string().min(2),
  currency: z.string().length(3).default("USD"),
  subtotal_amount: z.number().min(0).default(0),
  tax_amount: z.number().min(0).default(0),
  fee_amount: z.number().min(0).default(0),
  total_amount: z.number().min(0),
  status: z.enum(["pending", "approved", "rejected", "paid"]).default("pending"),
  approval_status: z.enum(["draft", "submitted", "in_review", "authorized", "declined"]).default("draft"),
  due_date: z.string().nullish(),
  submitted_by: z.string().uuid().nullish(),
  approved_by: z.string().uuid().nullish(),
  paid_at: z.string().nullish(),
  fraud_score: z.number().min(0).max(100).default(0),
  extracted_data: z.record(z.unknown()).default({}),
  notes: z.string().nullish()
});

export const paymentSchema = z.object({
  invoice_id: z.string().uuid(),
  payment_method_id: z.string().uuid().nullish(),
  bank_account_id: z.string().uuid().nullish(),
  amount: z.number().min(0),
  currency: z.string().length(3).default("USD"),
  status: z.enum(["pending", "authorized", "processing", "paid", "failed", "cancelled"]).default("pending"),
  approval_stage: z.enum(["submitted", "reviewed", "approved", "settled"]).default("submitted"),
  initiated_by: z.string().uuid().nullish(),
  approved_by: z.string().uuid().nullish(),
  processed_at: z.string().nullish(),
  settlement_reference: z.string().nullish()
});

export const shipmentSchema = z.object({
  vendor_id: z.string().uuid().nullish(),
  carrier_id: z.string().uuid().nullish(),
  terminal_id: z.string().uuid().nullish(),
  route_id: z.string().uuid().nullish(),
  shipment_number: z.string().min(2),
  mode: z.enum(["ocean", "air", "truck", "rail"]),
  origin_port: z.string().min(2),
  destination_port: z.string().min(2),
  status: z.enum(["draft", "in_transit", "arrived", "released", "held"]).default("draft"),
  release_status: z.enum(["pending_payment", "ready", "released", "blocked"]).default("pending_payment"),
  departure_at: z.string().nullish(),
  arrival_at: z.string().nullish(),
  released_at: z.string().nullish(),
  metadata: z.record(z.unknown()).default({})
});

export const containerSchema = z.object({
  shipment_id: z.string().uuid(),
  container_number: z.string().min(2),
  size_type: z.string().min(2),
  status: z.enum(["awaiting_payment", "ready_for_release", "released", "hold"]).default("awaiting_payment"),
  demurrage_fee: z.number().min(0).default(0),
  detention_fee: z.number().min(0).default(0),
  release_code: z.string().nullish()
});

export const documentSchema = z.object({
  invoice_id: z.string().uuid().nullish(),
  shipment_id: z.string().uuid().nullish(),
  container_id: z.string().uuid().nullish(),
  payment_id: z.string().uuid().nullish(),
  name: z.string().min(2),
  document_type: z.enum(["bill_of_lading", "invoice", "receipt", "shipping_document", "other"]),
  storage_bucket: z.string().default("documents"),
  storage_path: z.string().min(2),
  mime_type: z.string().nullish(),
  size_bytes: z.number().int().min(0).default(0),
  uploaded_by: z.string().uuid().nullish()
});

export const notificationSchema = z.object({
  user_id: z.string().uuid().nullish(),
  type: z.enum(["payment", "invoice", "shipment", "compliance", "system"]),
  title: z.string().min(2),
  message: z.string().min(2),
  status: z.enum(["unread", "read", "archived"]).default("unread"),
  channel: z.enum(["in_app", "email", "sms", "webhook"]).default("in_app"),
  entity_type: z.string().nullish(),
  entity_id: z.string().uuid().nullish(),
  read_at: z.string().nullish()
});

export const complianceSchema = z.object({
  vendor_id: z.string().uuid().nullish(),
  shipment_id: z.string().uuid().nullish(),
  record_type: z.enum(["kyc", "aml", "sanctions", "insurance", "customs"]),
  status: z.enum(["pending", "passed", "failed", "expired"]).default("pending"),
  expires_at: z.string().nullish(),
  notes: z.string().nullish(),
  score: z.number().min(0).max(100).nullish()
});

export const disputeSchema = z.object({
  invoice_id: z.string().uuid().nullish(),
  payment_id: z.string().uuid().nullish(),
  raised_by: z.string().uuid().nullish(),
  status: z.enum(["open", "under_review", "resolved", "closed"]).default("open"),
  reason: z.string().min(2),
  resolution_notes: z.string().nullish(),
  opened_at: z.string().optional(),
  closed_at: z.string().nullish()
});

export const terminalSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  location: z.string().min(2),
  country: z.string().min(2),
  status: z.enum(["active", "inactive"]).default("active"),
  contact_email: z.string().email().nullish()
});

export const carrierSchema = z.object({
  scac: z.string().min(2),
  name: z.string().min(2),
  mode: z.enum(["ocean", "air", "truck", "rail"]),
  status: z.enum(["active", "inactive"]).default("active"),
  contact_email: z.string().email().nullish()
});

export const routeSchema = z.object({
  carrier_id: z.string().uuid().nullish(),
  origin: z.string().min(2),
  destination: z.string().min(2),
  route_code: z.string().min(2),
  mode: z.enum(["ocean", "air", "truck", "rail"]),
  average_transit_days: z.number().int().min(0).default(0),
  status: z.enum(["active", "inactive"]).default("active")
});

export const feeSchema = z.object({
  invoice_id: z.string().uuid().nullish(),
  shipment_id: z.string().uuid().nullish(),
  container_id: z.string().uuid().nullish(),
  fee_type: z.enum(["demurrage", "detention", "service", "fx", "other"]),
  description: z.string().min(2),
  amount: z.number().min(0),
  currency: z.string().length(3).default("USD"),
  status: z.enum(["open", "waived", "paid"]).default("open")
});

export const contractSchema = z.object({
  vendor_id: z.string().uuid().nullish(),
  carrier_id: z.string().uuid().nullish(),
  terminal_id: z.string().uuid().nullish(),
  contract_number: z.string().min(2),
  start_date: z.string(),
  end_date: z.string().nullish(),
  status: z.enum(["draft", "active", "expired"]).default("draft"),
  payment_terms: z.record(z.unknown()).default({})
});

export const bankAccountSchema = z.object({
  vendor_id: z.string().uuid().nullish(),
  bank_name: z.string().min(2),
  account_last4: z.string().min(4).max(4),
  currency: z.string().length(3).default("USD"),
  is_default: z.boolean().default(false),
  routing_hint: z.string().nullish(),
  status: z.enum(["active", "disabled"]).default("active")
});

export const paymentMethodSchema = z.object({
  method_type: z.enum(["ach", "wire", "card", "wallet"]),
  provider: z.string().min(2),
  brand: z.string().nullish(),
  last4: z.string().nullish(),
  expiry_month: z.number().int().min(1).max(12).nullish(),
  expiry_year: z.number().int().min(2024).nullish(),
  is_default: z.boolean().default(false),
  status: z.enum(["active", "disabled"]).default("active")
});

export const cargoSchema = z.object({
  shipment_id: z.string().uuid(),
  container_id: z.string().uuid().nullish(),
  description: z.string().min(2),
  commodity_code: z.string().nullish(),
  weight_kg: z.number().min(0).default(0),
  package_count: z.number().int().min(0).default(0),
  hazardous: z.boolean().default(false),
  status: z.enum(["booked", "in_transit", "available", "released"]).default("booked")
});

export const transactionSchema = z.object({
  payment_id: z.string().uuid().nullish(),
  invoice_id: z.string().uuid().nullish(),
  transaction_type: z.enum(["payment", "refund", "fee", "release"]),
  amount: z.number().min(0),
  currency: z.string().length(3).default("USD"),
  status: z.enum(["pending", "posted", "failed"]).default("pending"),
  processor_reference: z.string().nullish(),
  metadata: z.record(z.unknown()).default({})
});

export const exchangeRateSchema = z.object({
  base_currency: z.string().length(3),
  quote_currency: z.string().length(3),
  rate: z.number().positive(),
  effective_date: z.string(),
  source: z.string().default("manual")
});

export const creditProfileSchema = z.object({
  vendor_id: z.string().uuid().nullish(),
  credit_limit: z.number().min(0).default(0),
  available_credit: z.number().min(0).default(0),
  risk_band: z.enum(["prime", "standard", "watch", "restricted"]).default("standard"),
  score: z.number().int().min(0).max(1000).default(650),
  days_sales_outstanding: z.number().int().min(0).default(0)
});
