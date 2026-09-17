# LeadPilot AI — Production-Ready Multi-Tenant SaaS Platform

> **"Turn every enquiry into a follow-up and every follow-up into a customer."**

LeadPilot AI is an enterprise-grade, multi-tenant AI-powered lead management and follow-up automation SaaS platform engineered initially for Indian real estate agencies and brokerages. The application captures enquiries across diverse channels, qualifies leads using Large Language Models with strict schema validation, scores buyer intent, drafts grounded WhatsApp responses without hallucinations, schedules multi-channel follow-ups, and provides real-time financial pipeline analytics.

Its domain-agnostic architecture is designed for turnkey expansion into insurance advisory, healthcare clinics, education consulting, interior design, and automobile dealerships.

---

## 1. Executive Summary & Core Value Proposition

In the Indian real estate market, over 70% of inbound enquiries from portals (99acres, MagicBricks, Housing.com), social media ads (Facebook, Instagram), and website landing pages go cold due to delayed follow-ups and ungrounded customer communications. 

LeadPilot AI solves this through three core pillars:
1. **Instant AI Qualification & Scoring**: Extracts budget, BHK preference, locality, timeline, and urgency into structured JSON within seconds.
2. **Hallucination-Free AI Communication**: Generates WhatsApp replies grounded strictly in verified inventory from the database. It never invents property availability or prices.
3. **Automated Follow-up Discipline**: Tracks Today's, Overdue, and Upcoming outreach across phone calls, WhatsApp, and email, ensuring no high-intent lead is dropped.

---

## 2. Technology Stack & Infrastructure

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | Next.js 14 (App Router, Server Components & Client Components) |
| **Language** | TypeScript (Strict mode enabled, zero unnecessary `any`) |
| **Styling & Design System** | Tailwind CSS with custom SaaS tokens (Linear/Attio-inspired palette) |
| **Iconography & UI** | Lucide React, Radix UI primitives |
| **Charts & Visualizations** | Recharts (Responsive bar charts, funnel stages, trend analytics) |
| **Database & ORM** | PostgreSQL (AWS RDS / Supabase / Neon) via Prisma ORM 5.x |
| **Zero-Config Local Dev** | SQLite schema (`prisma/schema.sqlite.prisma`) with pre-seeded data |
| **Authentication** | Stateless secure session JWTs using `jose` with HTTP-only cookies |
| **Password Hashing** | `bcryptjs` (salt rounds: 10) |
| **AI Provider Abstraction** | Pluggable interface (`IAIProvider`) with Google Gemini 1.5 Flash, Claude 3.5, OpenAI GPT-4o, and safe offline Mock heuristics |
| **Schema Validation** | Zod (Validating all AI outputs, API payloads, and CSV rows) |
| **Payments** | Razorpay Subscription integration with HMAC-SHA256 signature verification |
| **Messaging** | Meta WhatsApp Business Cloud API & Webhooks abstraction |
| **Email** | Amazon SES v2 SDK abstraction |
| **Test Framework** | Vitest (Automated unit, isolation, and integration test suite) |

---

## 3. Directory & Architecture Layout

```
C:\leadpilot-ai\
├── app/                                # Next.js 14 App Router
│   ├── (auth)/                         # Authentication routes
│   │   ├── login/page.tsx              # Modern login with 1-click demo fillers
│   │   └── register/page.tsx           # Agency signup & organization onboarding
│   ├── dashboard/page.tsx              # Executive KPI Dashboard & Funnel Analytics
│   ├── leads/                          # Lead Management
│   │   ├── page.tsx                    # Search, multi-filters, sorting, bulk actions
│   │   └── [id]/page.tsx               # Comprehensive CRM Profile, AI Reply & Matching
│   ├── followups/page.tsx              # Follow-up Engine (Today, Overdue, Upcoming)
│   ├── properties/page.tsx             # Verified Real Estate Inventory Catalog
│   ├── analytics/page.tsx              # Channel ROI & Conversion Performance
│   ├── ai-assistant/page.tsx           # Conversational AI Agent with Controlled Tools
│   ├── team/page.tsx                   # Team Management & RBAC Permissions
│   ├── settings/page.tsx               # Business Profile, AI Config & Subscriptions
│   ├── embed-demo/page.tsx             # Live External Website Lead Capture Simulation
│   ├── layout.tsx                      # Root layout with Inter font & metadata
│   ├── globals.css                     # Global design tokens and scrollbar styles
│   └── api/                            # Server-Side API Handlers (Tenant-isolated)
│       ├── auth/                       # Login, register, logout, current user session
│       ├── leads/                      # Lead CRUD, Status, Assignment, AI Qualification
│       │   ├── [id]/analyze/           # AI Lead Qualification endpoint
│       │   ├── [id]/generate-reply/    # Grounded AI WhatsApp Reply Generator
│       │   ├── [id]/generate-followup/ # AI Follow-up Suggestion generator
│       │   ├── [id]/properties/        # Deterministic property matching
│       │   └── import/                 # CSV file upload, preview & duplicate check
│       ├── followups/                  # Schedule, list, and complete follow-ups
│       ├── properties/                 # Verified Inventory CRUD
│       ├── analytics/                  # KPI counts, pipeline value, source performance
│       ├── ai-assistant/               # Controlled tool execution engine
│       ├── team/                       # Member list and invite dispatch
│       ├── settings/                   # Organization and AI preference mutations
│       ├── subscriptions/              # Razorpay checkout & subscription tracking
│       ├── public/leads/               # Public CORS lead capture endpoint (Anti-spam)
│       ├── widget/leadpilot.js/        # Embeddable JavaScript widget snippet
│       └── webhooks/                   # Webhook listeners for Razorpay & WhatsApp
├── components/                         # Modular UI Components
│   ├── sidebar.tsx                     # Collapsible, Linear-inspired dark navigation
│   ├── header.tsx                      # Top bar with notification center & shortcuts
│   ├── add-lead-modal.tsx              # Manual lead entry modal with AI auto-analyze
│   ├── csv-import-modal.tsx            # CSV mapping, validation preview & deduplication
│   └── ui/badge.tsx                    # Status, Priority, and AI Score Badges
├── lib/
│   ├── auth.ts                         # Session cookie handling & password hashing
│   ├── rbac.ts                         # Role-based permissions matrix
│   ├── tenant.ts                       # Multi-tenant isolation query scoping helpers
│   ├── prisma.ts                       # Prisma Client singleton
│   └── validations/                    # Zod validation schemas
├── services/
│   ├── ai/                             # Provider abstraction, Gemini, Mock, OpenAI, Claude
│   ├── property-matching/              # Deterministic database filter & score ranker
│   ├── csv-import/                     # CSV parser and duplicate detector
│   ├── payment/                        # Razorpay service abstraction & mock provider
│   ├── whatsapp/                       # WhatsApp Cloud API & mock provider
│   ├── email/                          # Amazon SES & mock provider
│   └── audit/                          # AuditLog event recorder
├── prisma/
│   ├── schema.prisma                   # Production PostgreSQL schema
│   └── schema.sqlite.prisma            # Zero-dependency local SQLite schema
├── scripts/
│   └── seed.mjs                        # Realistic demo seed: "Chennai Prime Realty"
└── tests/                              # Vitest automated test suite
```

---

## 4. Multi-Tenancy & Security Architecture

### Strict Tenant Scoping
Every tenant-owned record in the database contains an `organizationId` foreign key. The `requireTenant(req, requiredAction)` middleware validates the authenticated user's session and extracts their `organizationId`. Queries are enforced using scoped filters:

```typescript
const { context, errorResponse } = await requireTenant(req, "lead:view");
if (errorResponse) return errorResponse;

const leads = await prisma.lead.findMany({
  where: { organizationId: context.organizationId, ...filters }
});
```

### Role-Based Access Control (RBAC)
Four distinct roles are enforced strictly on the server:
* **`OWNER`**: Full control over organization data, team management, AI configuration, billing, and subscription plans.
* **`ADMIN`**: Team invitations, property CRUD, lead management, and AI settings (excluding billing ownership).
* **`MANAGER`**: Team-wide analytics, assigning leads to sales agents, and overseeing follow-ups.
* **`SALES_USER`**: View assigned leads, schedule follow-ups, update lead statuses, and generate grounded AI replies. Forbidden from deleting records, modifying billing, or inviting team members.

---

## 5. AI Engine & Grounded Reply Safety

### 1. Lead Qualification Schema (`analyzeLead`)
Enquiries are parsed into strict Zod-validated structures:
```json
{
  "summary": "Customer seeking a 2BHK flat in Tambaram under 70 Lakhs",
  "intent": "BUY",
  "location": "Tambaram",
  "propertyType": "Apartment",
  "bedrooms": 2,
  "budgetMin": 5600000,
  "budgetMax": 7000000,
  "urgency": "HIGH",
  "leadScore": 88,
  "missingInformation": [
    "Preferred possession timeline",
    "Home loan pre-approval status"
  ],
  "recommendedNextAction": "Call immediately to schedule site visit"
}
```

### 2. Strict AI Safety & Grounding Rules
* **No Invented Properties**: The AI reply generator queries the database for available inventory first and passes only verified listings to the prompt.
* **No Invented Prices**: Prices quoted in replies match verified listing amounts.
* **Concise & WhatsApp-Ready**: Output is formatted in natural Indian English under 60 words.
* **Drafts First**: Every AI-generated reply is stored as an editable draft in the CRM before being copied or sent via WhatsApp.

---

## 6. Core Modules Walkthrough

### Module 1: Dashboard (`/dashboard`)
* **KPI Metrics**: Today's Leads, New Leads, Hot Leads (75+), Warm Leads, Due Follow-ups, Site Visits, Converted, and Lost.
* **Financial Pipeline**: Active pipeline value (₹ Crores/Lakhs) and converted deal revenue.
* **Interactive Charts**: 14-day daily enquiry trend and channel conversion rate breakdown.

### Module 2: Lead Management & CRM Detail (`/leads` & `/leads/[id]`)
* Comprehensive search across customer names, phone numbers, localities, and requirements.
* Multi-field filtering by Status (`NEW` to `CONVERTED`), Source (`WHATSAPP`, `WEBSITE`, `PORTAL`, etc.), and Urgency.
* Bulk status actions and assignment to agents.
* Detail CRM workspace featuring contact details, AI analysis card, grounded reply generator, follow-up scheduler, and matching property recommendations.

### Module 3: Property Catalog & Matching (`/properties`)
* Real estate inventory catalog supporting Apartments, Villas, Plots, and Commercial units.
* Deterministic matching engine that filters by budget (with 15% negotiation tolerance), BHK count, and locality, returning match scores and explicit match rationales.

### Module 4: Follow-up Engine (`/followups`)
* Multi-channel task tracker (`CALL`, `WHATSAPP`, `EMAIL`, `TASK`).
* Filter tabs for **Today's**, **Overdue**, and **Upcoming** follow-ups.
* AI Follow-up generator drafting personalized check-in messages.

### Module 5: Conversational AI Assistant (`/ai-assistant`)
* Natural language copilot connected to controlled server-side tools:
  * `getLeads()`, `getOverdueFollowups()`, `getProperties()`, `getAnalytics()`, `generateReply()`.
* Implements safety confirmation prompts before taking external actions.

### Module 6: CSV Bulk Import (`/leads` -> Import CSV)
* Upload CSV files with column mapping preview.
* Validates phone numbers and emails.
* Checks for duplicates against existing CRM records to prevent accidental overwrites.

### Module 7: Embeddable Website Lead Capture (`/embed-demo`)
* 1-line script embed:
  ```html
  <script src="http://localhost:3000/api/widget/leadpilot.js" data-org="ORGANIZATION_ID"></script>
  ```
* Injects a floating "Enquire Property" modal with anti-spam honeypot protection, rate limiting, and automated AI scoring.

### Module 8: Subscriptions & Billing (`/settings`)
* Database-backed subscription plans:
  * **STARTER**: ₹999/month (Up to 500 leads/mo)
  * **GROWTH**: ₹2,499/month (Up to 5,000 leads/mo)
  * **BUSINESS**: ₹4,999/month (Unlimited leads)
* Razorpay payment gateway integration with HMAC-SHA256 webhook verification.

---

## 7. Quick Local Setup

### Step 1: Install Dependencies
```bash
cd C:\leadpilot-ai
npm install
```

### Step 2: Push Database Schema & Seed Data
```bash
npm run db:push:sqlite
npm run db:seed
```

### Step 3: Launch Application
```bash
npm run dev
```

Open **`http://localhost:3000`** in your browser.

### Pre-Configured Demo Accounts (Chennai Prime Realty)
* **Owner**: `suresh@chennaiprimerealty.com` / `Leadpilot@123`
* **Admin**: `deepa@chennaiprimerealty.com` / `Leadpilot@123`
* **Manager**: `venkatesh@chennaiprimerealty.com` / `Leadpilot@123`
* **Sales User**: `karthik@chennaiprimerealty.com` / `Leadpilot@123`
* **Sales User**: `ananya@chennaiprimerealty.com` / `Leadpilot@123`

*(One-click demo buttons are available on the login page for instant sign-in)*

---

## 8. Verification & Automated Tests

Run the full automated test suite:

```bash
npm run test
```

### Test Suite Coverage (13 Tests Passing):
1. **Multi-Tenant Isolation & RBAC** (`tests/auth-isolation.test.ts`):
   * Confirms `tenantFilter` throws an error if `organizationId` is missing.
   * Verifies `SALES_USER` cannot manage team, billing, or delete leads.
   * Validates `OWNER` administrative privileges.
2. **AI Schema Validation** (`tests/ai-schema.test.ts`):
   * Confirms Zod rejects invalid intents and out-of-bounds lead scores.
   * Tests parsing of Indian real estate enquiries.
3. **CSV Import & Deduplication** (`tests/csv-import.test.ts`):
   * Verifies CSV header mapping and empty field resilience.
4. **Webhook Signature Security** (`tests/webhook.test.ts`):
   * Validates HMAC-SHA256 signature verification for Razorpay and WhatsApp Graph API handshakes.

### Build Verification
```bash
npm run build
```
Compiles all 34 static and dynamic routes with **0 errors and 0 warnings**.

---

## 9. Deployment Guide

### PostgreSQL Database (AWS RDS / Supabase / Neon)
1. Provision a PostgreSQL instance.
2. Set your connection string in `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@rds-host:5432/leadpilot?sslmode=require"
   ```
3. Apply Prisma migrations:
   ```bash
   npx prisma migrate deploy --schema=prisma/schema.prisma
   ```

### Application Hosting (Vercel / Cloudflare / AWS ECS)
1. Add environment variables in the hosting provider dashboard.
2. Build command: `npm run build`
3. Start command: `npm run start`

---

## 10. Market Positioning vs. Existing Solutions

| Feature | Legacy Real Estate CRMs (e.g. Sell.do) | LeadPilot AI |
| :--- | :--- | :--- |
| **Grounded AI Communication** | Static canned templates | Generates dynamic WhatsApp drafts grounded strictly in real database listings without hallucinations |
| **Intent & Urgency Scoring** | Simple checkbox point rules | Multi-factor LLM qualification extraction with Zod validation |
| **Natural Language Queries** | Traditional SQL filter dropdowns | Controlled Conversational AI Assistant (`/ai-assistant`) |
| **Multi-Tenant Extensibility** | Locked to real estate only | Flexible schema ready for Insurance, Clinics, Interior Design, and Auto Dealerships |
| **Code Ownership & Deployment** | Expensive recurring proprietary licenses | Self-hostable, modern Next.js 14 architecture with full code ownership |

