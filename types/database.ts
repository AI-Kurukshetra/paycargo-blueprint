export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Timestamps = {
  created_at: string;
  updated_at: string;
};

type CrudTable<Row, Insert = Partial<Row>, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
};

type UserRole = "admin" | "payer" | "vendor" | "approver" | "viewer";
type OrgStatus = "active" | "pending" | "suspended";
type InvoiceStatus = "pending" | "approved" | "rejected" | "paid";
type PaymentStatus = "pending" | "authorized" | "processing" | "paid" | "failed" | "cancelled";
type ShipmentMode = "ocean" | "air" | "truck" | "rail";

export type Database = {
  public: {
    Tables: {
      organizations: CrudTable<
        Timestamps & { id: string; name: string; slug: string; type: "shipper" | "broker" | "carrier" | "terminal" | "financial_partner"; base_currency: string; timezone: string; status: OrgStatus; metadata: Json },
        { id?: string; name: string; slug: string; type?: "shipper" | "broker" | "carrier" | "terminal" | "financial_partner"; base_currency?: string; timezone?: string; status?: OrgStatus; metadata?: Json }
      >;
      users: CrudTable<
        Timestamps & { id: string; organization_id: string | null; email: string; full_name: string; role: UserRole; phone: string | null; job_title: string | null; status: "invited" | "active" | "disabled"; last_sign_in_at: string | null },
        { id: string; organization_id?: string | null; email: string; full_name: string; role?: UserRole; phone?: string | null; job_title?: string | null; status?: "invited" | "active" | "disabled"; last_sign_in_at?: string | null }
      >;
      organization_memberships: CrudTable<
        Timestamps & { id: string; organization_id: string; user_id: string; role: UserRole; is_primary: boolean },
        { id?: string; organization_id: string; user_id: string; role: UserRole; is_primary?: boolean }
      >;
      vendors: CrudTable<
        Timestamps & { id: string; organization_id: string; vendor_code: string; legal_name: string; vendor_type: "carrier" | "terminal" | "logistics_vendor" | "freight_forwarder"; contact_name: string | null; contact_email: string | null; contact_phone: string | null; status: "onboarding" | "active" | "blocked"; risk_rating: "low" | "medium" | "high"; payment_terms_days: number; metadata: Json },
        { id?: string; organization_id: string; vendor_code: string; legal_name: string; vendor_type: "carrier" | "terminal" | "logistics_vendor" | "freight_forwarder"; contact_name?: string | null; contact_email?: string | null; contact_phone?: string | null; status?: "onboarding" | "active" | "blocked"; risk_rating?: "low" | "medium" | "high"; payment_terms_days?: number; metadata?: Json }
      >;
      invoices: CrudTable<
        Timestamps & { id: string; organization_id: string; vendor_id: string; shipment_id: string | null; container_id: string | null; invoice_number: string; currency: string; subtotal_amount: number; tax_amount: number; fee_amount: number; total_amount: number; status: InvoiceStatus; approval_status: "draft" | "submitted" | "in_review" | "authorized" | "declined"; due_date: string | null; submitted_by: string | null; approved_by: string | null; paid_at: string | null; fraud_score: number; extracted_data: Json; notes: string | null },
        { id?: string; organization_id: string; vendor_id: string; shipment_id?: string | null; container_id?: string | null; invoice_number: string; currency?: string; subtotal_amount?: number; tax_amount?: number; fee_amount?: number; total_amount: number; status?: InvoiceStatus; approval_status?: "draft" | "submitted" | "in_review" | "authorized" | "declined"; due_date?: string | null; submitted_by?: string | null; approved_by?: string | null; paid_at?: string | null; fraud_score?: number; extracted_data?: Json; notes?: string | null }
      >;
      payments: CrudTable<
        Timestamps & { id: string; organization_id: string; invoice_id: string; payment_method_id: string | null; bank_account_id: string | null; amount: number; currency: string; status: PaymentStatus; approval_stage: "submitted" | "reviewed" | "approved" | "settled"; initiated_by: string | null; approved_by: string | null; processed_at: string | null; settlement_reference: string | null; release_triggered_at: string | null },
        { id?: string; organization_id: string; invoice_id: string; payment_method_id?: string | null; bank_account_id?: string | null; amount: number; currency?: string; status?: PaymentStatus; approval_stage?: "submitted" | "reviewed" | "approved" | "settled"; initiated_by?: string | null; approved_by?: string | null; processed_at?: string | null; settlement_reference?: string | null; release_triggered_at?: string | null }
      >;
      shipments: CrudTable<
        Timestamps & { id: string; organization_id: string; vendor_id: string | null; carrier_id: string | null; terminal_id: string | null; route_id: string | null; shipment_number: string; mode: ShipmentMode; origin_port: string; destination_port: string; status: "draft" | "in_transit" | "arrived" | "released" | "held"; release_status: "pending_payment" | "ready" | "released" | "blocked"; departure_at: string | null; arrival_at: string | null; released_at: string | null; metadata: Json },
        { id?: string; organization_id: string; vendor_id?: string | null; carrier_id?: string | null; terminal_id?: string | null; route_id?: string | null; shipment_number: string; mode: ShipmentMode; origin_port: string; destination_port: string; status?: "draft" | "in_transit" | "arrived" | "released" | "held"; release_status?: "pending_payment" | "ready" | "released" | "blocked"; departure_at?: string | null; arrival_at?: string | null; released_at?: string | null; metadata?: Json }
      >;
      containers: CrudTable<
        Timestamps & { id: string; shipment_id: string; container_number: string; size_type: string; status: "awaiting_payment" | "ready_for_release" | "released" | "hold"; demurrage_fee: number; detention_fee: number; release_code: string | null },
        { id?: string; shipment_id: string; container_number: string; size_type: string; status?: "awaiting_payment" | "ready_for_release" | "released" | "hold"; demurrage_fee?: number; detention_fee?: number; release_code?: string | null }
      >;
      cargo: CrudTable<
        Timestamps & { id: string; shipment_id: string; container_id: string | null; description: string; commodity_code: string | null; weight_kg: number; package_count: number; hazardous: boolean; status: "booked" | "in_transit" | "available" | "released" },
        { id?: string; shipment_id: string; container_id?: string | null; description: string; commodity_code?: string | null; weight_kg?: number; package_count?: number; hazardous?: boolean; status?: "booked" | "in_transit" | "available" | "released" }
      >;
      transactions: CrudTable<
        Timestamps & { id: string; payment_id: string | null; invoice_id: string | null; transaction_type: "payment" | "refund" | "fee" | "release"; amount: number; currency: string; status: "pending" | "posted" | "failed"; processor_reference: string | null; metadata: Json },
        { id?: string; payment_id?: string | null; invoice_id?: string | null; transaction_type: "payment" | "refund" | "fee" | "release"; amount: number; currency?: string; status?: "pending" | "posted" | "failed"; processor_reference?: string | null; metadata?: Json }
      >;
      documents: CrudTable<
        Timestamps & { id: string; organization_id: string; invoice_id: string | null; shipment_id: string | null; container_id: string | null; payment_id: string | null; name: string; document_type: "bill_of_lading" | "invoice" | "receipt" | "shipping_document" | "other"; storage_bucket: string; storage_path: string; mime_type: string | null; size_bytes: number; uploaded_by: string | null },
        { id?: string; organization_id: string; invoice_id?: string | null; shipment_id?: string | null; container_id?: string | null; payment_id?: string | null; name: string; document_type: "bill_of_lading" | "invoice" | "receipt" | "shipping_document" | "other"; storage_bucket?: string; storage_path: string; mime_type?: string | null; size_bytes?: number; uploaded_by?: string | null }
      >;
      audit_logs: CrudTable<
        { id: string; organization_id: string | null; user_id: string | null; entity_type: string; entity_id: string; action: string; before_data: Json; after_data: Json; ip_address: string | null; user_agent: string | null; created_at: string },
        { id?: string; organization_id?: string | null; user_id?: string | null; entity_type: string; entity_id: string; action: string; before_data?: Json; after_data?: Json; ip_address?: string | null; user_agent?: string | null; created_at?: string },
        never
      >;
      exchange_rates: CrudTable<
        Timestamps & { id: string; base_currency: string; quote_currency: string; rate: number; effective_date: string; source: string },
        { id?: string; base_currency: string; quote_currency: string; rate: number; effective_date: string; source?: string }
      >;
      compliance_records: CrudTable<
        Timestamps & { id: string; organization_id: string; vendor_id: string | null; shipment_id: string | null; record_type: "kyc" | "aml" | "sanctions" | "insurance" | "customs"; status: "pending" | "passed" | "failed" | "expired"; expires_at: string | null; notes: string | null; score: number | null },
        { id?: string; organization_id: string; vendor_id?: string | null; shipment_id?: string | null; record_type: "kyc" | "aml" | "sanctions" | "insurance" | "customs"; status?: "pending" | "passed" | "failed" | "expired"; expires_at?: string | null; notes?: string | null; score?: number | null }
      >;
      credit_profiles: CrudTable<
        Timestamps & { id: string; organization_id: string; vendor_id: string | null; credit_limit: number; available_credit: number; risk_band: "prime" | "standard" | "watch" | "restricted"; score: number; days_sales_outstanding: number },
        { id?: string; organization_id: string; vendor_id?: string | null; credit_limit?: number; available_credit?: number; risk_band?: "prime" | "standard" | "watch" | "restricted"; score?: number; days_sales_outstanding?: number }
      >;
      notifications: CrudTable<
        { id: string; organization_id: string | null; user_id: string | null; type: "payment" | "invoice" | "shipment" | "compliance" | "system"; title: string; message: string; status: "unread" | "read" | "archived"; channel: "in_app" | "email" | "sms" | "webhook"; entity_type: string | null; entity_id: string | null; created_at: string; read_at: string | null },
        { id?: string; organization_id?: string | null; user_id?: string | null; type: "payment" | "invoice" | "shipment" | "compliance" | "system"; title: string; message: string; status?: "unread" | "read" | "archived"; channel?: "in_app" | "email" | "sms" | "webhook"; entity_type?: string | null; entity_id?: string | null; created_at?: string; read_at?: string | null }
      >;
      disputes: CrudTable<
        Timestamps & { id: string; organization_id: string; invoice_id: string | null; payment_id: string | null; raised_by: string | null; status: "open" | "under_review" | "resolved" | "closed"; reason: string; resolution_notes: string | null; opened_at: string; closed_at: string | null },
        { id?: string; organization_id: string; invoice_id?: string | null; payment_id?: string | null; raised_by?: string | null; status?: "open" | "under_review" | "resolved" | "closed"; reason: string; resolution_notes?: string | null; opened_at?: string; closed_at?: string | null }
      >;
      terminals: CrudTable<
        Timestamps & { id: string; organization_id: string; code: string; name: string; location: string; country: string; status: "active" | "inactive"; contact_email: string | null },
        { id?: string; organization_id: string; code: string; name: string; location: string; country: string; status?: "active" | "inactive"; contact_email?: string | null }
      >;
      carriers: CrudTable<
        Timestamps & { id: string; organization_id: string; scac: string; name: string; mode: ShipmentMode; status: "active" | "inactive"; contact_email: string | null },
        { id?: string; organization_id: string; scac: string; name: string; mode: ShipmentMode; status?: "active" | "inactive"; contact_email?: string | null }
      >;
      routes: CrudTable<
        Timestamps & { id: string; organization_id: string; carrier_id: string | null; origin: string; destination: string; route_code: string; mode: ShipmentMode; average_transit_days: number; status: "active" | "inactive" },
        { id?: string; organization_id: string; carrier_id?: string | null; origin: string; destination: string; route_code: string; mode: ShipmentMode; average_transit_days?: number; status?: "active" | "inactive" }
      >;
      fees: CrudTable<
        Timestamps & { id: string; organization_id: string; invoice_id: string | null; shipment_id: string | null; container_id: string | null; fee_type: "demurrage" | "detention" | "service" | "fx" | "other"; description: string; amount: number; currency: string; status: "open" | "waived" | "paid" },
        { id?: string; organization_id: string; invoice_id?: string | null; shipment_id?: string | null; container_id?: string | null; fee_type: "demurrage" | "detention" | "service" | "fx" | "other"; description: string; amount: number; currency?: string; status?: "open" | "waived" | "paid" }
      >;
      contracts: CrudTable<
        Timestamps & { id: string; organization_id: string; vendor_id: string | null; carrier_id: string | null; terminal_id: string | null; contract_number: string; start_date: string; end_date: string | null; status: "draft" | "active" | "expired"; payment_terms: Json },
        { id?: string; organization_id: string; vendor_id?: string | null; carrier_id?: string | null; terminal_id?: string | null; contract_number: string; start_date: string; end_date?: string | null; status?: "draft" | "active" | "expired"; payment_terms?: Json }
      >;
      bank_accounts: CrudTable<
        Timestamps & { id: string; organization_id: string; vendor_id: string | null; bank_name: string; account_last4: string; currency: string; is_default: boolean; routing_hint: string | null; status: "active" | "disabled" },
        { id?: string; organization_id: string; vendor_id?: string | null; bank_name: string; account_last4: string; currency?: string; is_default?: boolean; routing_hint?: string | null; status?: "active" | "disabled" }
      >;
      payment_methods: CrudTable<
        Timestamps & { id: string; organization_id: string; method_type: "ach" | "wire" | "card" | "wallet"; provider: string; brand: string | null; last4: string | null; expiry_month: number | null; expiry_year: number | null; is_default: boolean; status: "active" | "disabled" },
        { id?: string; organization_id: string; method_type: "ach" | "wire" | "card" | "wallet"; provider: string; brand?: string | null; last4?: string | null; expiry_month?: number | null; expiry_year?: number | null; is_default?: boolean; status?: "active" | "disabled" }
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type TableName = keyof Database["public"]["Tables"];
