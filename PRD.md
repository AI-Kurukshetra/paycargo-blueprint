# PayCargo Blueprint – Digital Freight Payment Platform

## Overview

Build a full-stack freight payment platform similar to PayCargo.

The platform enables logistics companies to manage freight invoices, process payments, automate cargo release, and track shipment payment status across carriers and terminals.

The system must support vendors, carriers, invoices, payments, shipment tracking, and financial reporting.

Tech stack:

* Next.js (App Router)
* TypeScript (strict)
* Supabase Postgres
* Supabase Auth
* Supabase Storage
* Vercel deployment

---

# Core Features

## 1. Multi-Modal Payment Processing

Support payments for:

* Ocean freight
* Air freight
* Truck freight
* Rail freight

Support multiple currencies and payment methods.

---

## 2. Invoice Management

Features:

* Vendor submits invoice
* Upload shipping documents
* Invoice approval workflow
* Invoice status tracking

Statuses:

* pending
* approved
* rejected
* paid

---

## 3. Cargo Release Automation

Once payment is completed:

payment.status = paid

The system automatically updates:

shipment.status = released

Trigger notifications.

---

## 4. Vendor Network Management

Support onboarding of:

* carriers
* terminals
* logistics vendors
* freight forwarders

---

## 5. Payment Authorization Workflow

Multi-level approval:

1. Vendor submits invoice
2. Payer reviews
3. Approver authorizes payment
4. Payment processed

---

## 6. Real-Time Payment Tracking

Track:

* invoice status
* payment status
* cargo release status

---

## 7. Container Payment Portal

Support container level payments:

Entities:

* containers
* cargo
* shipments

Track demurrage and detention fees.

---

## 8. User Role Management

Roles:

admin
payer
vendor
approver
viewer

Use Supabase Auth.

---

## 9. Document Management

Support document uploads:

* bill_of_lading
* invoices
* receipts
* shipping documents

Use Supabase Storage.

---

## 10. Audit Trail

Track all actions:

* invoice creation
* payment approval
* cargo release

Store in audit_logs table.

---

## 11. Dashboard Analytics

Dashboard must display:

* total payment volume
* pending invoices
* active vendors
* processing time
* shipment status

---

# Advanced Features

Implement at least one:

* AI invoice extraction
* predictive cashflow analytics
* fraud detection scoring

---

# Database Entities

Users
Organizations
Vendors
Invoices
Payments
Shipments
Containers
Cargo
Transactions
Documents
AuditLogs
ExchangeRates
ComplianceRecords
CreditProfiles
Notifications
Disputes
Terminals
Carriers
Routes
Fees
Contracts
BankAccounts
PaymentMethods

---

# API Groups

/auth
/users
/organizations
/vendors
/invoices
/payments
/shipments
/containers
/documents
/notifications
/reports
/analytics
/compliance
/disputes
/terminals
/carriers
/webhooks
/integrations

---

# Pages

Dashboard
Vendors
Invoices
Payments
Shipments
Containers
Documents
Reports
Settings

---

# Deployment

The system must deploy to Vercel.

Environment variables:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
