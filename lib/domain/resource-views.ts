type ColumnConfig = {
  key: string;
  label: string;
};

type FieldOption = {
  label: string;
  value: string;
};

type FieldConfig = {
  name: string;
  label: string;
  type: "text" | "email" | "number" | "date" | "select" | "textarea" | "checkbox";
  required?: boolean;
  placeholder?: string;
  options?: FieldOption[];
  source?: string;
  sourceLabelKey?: string;
  sourceValueKey?: string;
};

export type ResourceViewConfig = {
  title: string;
  description: string;
  apiPath: string;
  columns: ColumnConfig[];
  fields: FieldConfig[];
};

export const resourceViewConfigs: Record<string, ResourceViewConfig> = {
  vendors: {
    title: "Vendor Network",
    description: "Onboard and manage carriers, terminals, logistics vendors, and forwarders.",
    apiPath: "/api/v1/vendors",
    columns: [
      { key: "vendor_code", label: "Code" },
      { key: "legal_name", label: "Vendor" },
      { key: "vendor_type", label: "Type" },
      { key: "status", label: "Status" },
      { key: "risk_rating", label: "Risk" }
    ],
    fields: [
      { name: "vendor_code", label: "Vendor code", type: "text", required: true },
      { name: "legal_name", label: "Legal name", type: "text", required: true },
      {
        name: "vendor_type",
        label: "Vendor type",
        type: "select",
        required: true,
        options: [
          { label: "Carrier", value: "carrier" },
          { label: "Terminal", value: "terminal" },
          { label: "Logistics Vendor", value: "logistics_vendor" },
          { label: "Freight Forwarder", value: "freight_forwarder" }
        ]
      },
      { name: "contact_email", label: "Contact email", type: "email" },
      { name: "payment_terms_days", label: "Payment terms", type: "number" }
    ]
  },
  invoices: {
    title: "Invoices",
    description: "Capture freight charges, approvals, and AI-assisted fraud scoring.",
    apiPath: "/api/v1/invoices",
    columns: [
      { key: "invoice_number", label: "Invoice" },
      { key: "total_amount", label: "Amount" },
      { key: "status", label: "Status" },
      { key: "approval_status", label: "Approval" },
      { key: "fraud_score", label: "Fraud score" }
    ],
    fields: [
      {
        name: "vendor_id",
        label: "Vendor",
        type: "select",
        required: true,
        source: "/api/v1/vendors",
        sourceLabelKey: "legal_name",
        sourceValueKey: "id"
      },
      { name: "invoice_number", label: "Invoice number", type: "text", required: true },
      { name: "total_amount", label: "Total amount", type: "number", required: true },
      { name: "currency", label: "Currency", type: "text", placeholder: "USD" },
      { name: "due_date", label: "Due date", type: "date" },
      { name: "notes", label: "Notes", type: "textarea" }
    ]
  },
  payments: {
    title: "Payments",
    description: "Authorize, settle, and trigger cargo release once payment clears.",
    apiPath: "/api/v1/payments",
    columns: [
      { key: "invoice_id", label: "Invoice ID" },
      { key: "amount", label: "Amount" },
      { key: "status", label: "Status" },
      { key: "approval_stage", label: "Stage" },
      { key: "release_triggered_at", label: "Release" }
    ],
    fields: [
      {
        name: "invoice_id",
        label: "Invoice",
        type: "select",
        required: true,
        source: "/api/v1/invoices",
        sourceLabelKey: "invoice_number",
        sourceValueKey: "id"
      },
      { name: "amount", label: "Amount", type: "number", required: true },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Pending", value: "pending" },
          { label: "Authorized", value: "authorized" },
          { label: "Processing", value: "processing" },
          { label: "Paid", value: "paid" },
          { label: "Failed", value: "failed" }
        ]
      },
      {
        name: "approval_stage",
        label: "Approval stage",
        type: "select",
        options: [
          { label: "Submitted", value: "submitted" },
          { label: "Reviewed", value: "reviewed" },
          { label: "Approved", value: "approved" },
          { label: "Settled", value: "settled" }
        ]
      },
      { name: "settlement_reference", label: "Settlement reference", type: "text" }
    ]
  },
  shipments: {
    title: "Shipments",
    description: "Track modal movement, release readiness, and terminal visibility.",
    apiPath: "/api/v1/shipments",
    columns: [
      { key: "shipment_number", label: "Shipment" },
      { key: "mode", label: "Mode" },
      { key: "status", label: "Status" },
      { key: "release_status", label: "Release" },
      { key: "destination_port", label: "Destination" }
    ],
    fields: [
      { name: "shipment_number", label: "Shipment number", type: "text", required: true },
      {
        name: "mode",
        label: "Mode",
        type: "select",
        options: [
          { label: "Ocean", value: "ocean" },
          { label: "Air", value: "air" },
          { label: "Truck", value: "truck" },
          { label: "Rail", value: "rail" }
        ]
      },
      { name: "origin_port", label: "Origin", type: "text", required: true },
      { name: "destination_port", label: "Destination", type: "text", required: true },
      {
        name: "vendor_id",
        label: "Vendor",
        type: "select",
        source: "/api/v1/vendors",
        sourceLabelKey: "legal_name",
        sourceValueKey: "id"
      }
    ]
  },
  containers: {
    title: "Containers",
    description: "Manage container-level fees, holds, and release readiness.",
    apiPath: "/api/v1/containers",
    columns: [
      { key: "container_number", label: "Container" },
      { key: "size_type", label: "Size" },
      { key: "status", label: "Status" },
      { key: "demurrage_fee", label: "Demurrage" },
      { key: "detention_fee", label: "Detention" }
    ],
    fields: [
      {
        name: "shipment_id",
        label: "Shipment",
        type: "select",
        required: true,
        source: "/api/v1/shipments",
        sourceLabelKey: "shipment_number",
        sourceValueKey: "id"
      },
      { name: "container_number", label: "Container number", type: "text", required: true },
      { name: "size_type", label: "Size type", type: "text", required: true },
      { name: "demurrage_fee", label: "Demurrage fee", type: "number" },
      { name: "detention_fee", label: "Detention fee", type: "number" }
    ]
  },
  documents: {
    title: "Documents",
    description: "Upload invoices, bills of lading, receipts, and other release artifacts.",
    apiPath: "/api/v1/documents",
    columns: [
      { key: "name", label: "File" },
      { key: "document_type", label: "Type" },
      { key: "storage_path", label: "Storage path" },
      { key: "size_bytes", label: "Size" },
      { key: "created_at", label: "Uploaded" }
    ],
    fields: [
      { name: "name", label: "Document name", type: "text", required: true },
      {
        name: "document_type",
        label: "Type",
        type: "select",
        required: true,
        options: [
          { label: "Bill of Lading", value: "bill_of_lading" },
          { label: "Invoice", value: "invoice" },
          { label: "Receipt", value: "receipt" },
          { label: "Shipping Document", value: "shipping_document" },
          { label: "Other", value: "other" }
        ]
      },
      {
        name: "shipment_id",
        label: "Shipment",
        type: "select",
        source: "/api/v1/shipments",
        sourceLabelKey: "shipment_number",
        sourceValueKey: "id"
      },
      {
        name: "invoice_id",
        label: "Invoice",
        type: "select",
        source: "/api/v1/invoices",
        sourceLabelKey: "invoice_number",
        sourceValueKey: "id"
      }
    ]
  },
  notifications: {
    title: "Notifications",
    description: "Operational alerts from payment, compliance, and release workflows.",
    apiPath: "/api/v1/notifications",
    columns: [
      { key: "title", label: "Title" },
      { key: "type", label: "Type" },
      { key: "status", label: "Status" },
      { key: "channel", label: "Channel" },
      { key: "created_at", label: "Created" }
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "message", label: "Message", type: "textarea", required: true },
      {
        name: "type",
        label: "Type",
        type: "select",
        options: [
          { label: "Payment", value: "payment" },
          { label: "Invoice", value: "invoice" },
          { label: "Shipment", value: "shipment" },
          { label: "Compliance", value: "compliance" },
          { label: "System", value: "system" }
        ]
      }
    ]
  },
  compliance: {
    title: "Compliance",
    description: "Track KYC, insurance, customs, and sanctions checks.",
    apiPath: "/api/v1/compliance",
    columns: [
      { key: "record_type", label: "Record" },
      { key: "status", label: "Status" },
      { key: "score", label: "Score" },
      { key: "expires_at", label: "Expires" }
    ],
    fields: [
      {
        name: "vendor_id",
        label: "Vendor",
        type: "select",
        source: "/api/v1/vendors",
        sourceLabelKey: "legal_name",
        sourceValueKey: "id"
      },
      {
        name: "record_type",
        label: "Record type",
        type: "select",
        options: [
          { label: "KYC", value: "kyc" },
          { label: "AML", value: "aml" },
          { label: "Sanctions", value: "sanctions" },
          { label: "Insurance", value: "insurance" },
          { label: "Customs", value: "customs" }
        ]
      },
      { name: "expires_at", label: "Expires at", type: "date" },
      { name: "score", label: "Score", type: "number" }
    ]
  },
  disputes: {
    title: "Disputes",
    description: "Investigate invoice discrepancies and payment exceptions.",
    apiPath: "/api/v1/disputes",
    columns: [
      { key: "reason", label: "Reason" },
      { key: "status", label: "Status" },
      { key: "opened_at", label: "Opened" },
      { key: "closed_at", label: "Closed" }
    ],
    fields: [
      {
        name: "invoice_id",
        label: "Invoice",
        type: "select",
        source: "/api/v1/invoices",
        sourceLabelKey: "invoice_number",
        sourceValueKey: "id"
      },
      { name: "reason", label: "Reason", type: "textarea", required: true },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Open", value: "open" },
          { label: "Under Review", value: "under_review" },
          { label: "Resolved", value: "resolved" },
          { label: "Closed", value: "closed" }
        ]
      }
    ]
  },
  terminals: {
    title: "Terminals",
    description: "Control the terminal directory used by release automation.",
    apiPath: "/api/v1/terminals",
    columns: [
      { key: "code", label: "Code" },
      { key: "name", label: "Terminal" },
      { key: "location", label: "Location" },
      { key: "country", label: "Country" },
      { key: "status", label: "Status" }
    ],
    fields: [
      { name: "code", label: "Code", type: "text", required: true },
      { name: "name", label: "Name", type: "text", required: true },
      { name: "location", label: "Location", type: "text", required: true },
      { name: "country", label: "Country", type: "text", required: true },
      { name: "contact_email", label: "Contact email", type: "email" }
    ]
  },
  carriers: {
    title: "Carriers",
    description: "Manage carrier records and route eligibility for release notices.",
    apiPath: "/api/v1/carriers",
    columns: [
      { key: "scac", label: "SCAC" },
      { key: "name", label: "Carrier" },
      { key: "mode", label: "Mode" },
      { key: "status", label: "Status" }
    ],
    fields: [
      { name: "scac", label: "SCAC", type: "text", required: true },
      { name: "name", label: "Name", type: "text", required: true },
      {
        name: "mode",
        label: "Mode",
        type: "select",
        options: [
          { label: "Ocean", value: "ocean" },
          { label: "Air", value: "air" },
          { label: "Truck", value: "truck" },
          { label: "Rail", value: "rail" }
        ]
      },
      { name: "contact_email", label: "Contact email", type: "email" }
    ]
  },
  "payment-methods": {
    title: "Payment Methods",
    description: "Manage stored ACH, wire, card, and wallet methods for the payer organization.",
    apiPath: "/api/v1/payment-methods",
    columns: [
      { key: "method_type", label: "Type" },
      { key: "provider", label: "Provider" },
      { key: "brand", label: "Brand" },
      { key: "last4", label: "Last4" },
      { key: "status", label: "Status" }
    ],
    fields: [
      {
        name: "method_type",
        label: "Method type",
        type: "select",
        options: [
          { label: "ACH", value: "ach" },
          { label: "Wire", value: "wire" },
          { label: "Card", value: "card" },
          { label: "Wallet", value: "wallet" }
        ]
      },
      { name: "provider", label: "Provider", type: "text", required: true },
      { name: "brand", label: "Brand", type: "text" },
      { name: "last4", label: "Last four", type: "text" }
    ]
  },
  "bank-accounts": {
    title: "Bank Accounts",
    description: "Configure settlement accounts used in the payment workflow.",
    apiPath: "/api/v1/bank-accounts",
    columns: [
      { key: "bank_name", label: "Bank" },
      { key: "account_last4", label: "Last4" },
      { key: "currency", label: "Currency" },
      { key: "status", label: "Status" }
    ],
    fields: [
      { name: "bank_name", label: "Bank name", type: "text", required: true },
      { name: "account_last4", label: "Last four", type: "text", required: true },
      { name: "currency", label: "Currency", type: "text", placeholder: "USD" },
      { name: "routing_hint", label: "Routing hint", type: "text" }
    ]
  }
};
