# LeadPilot AI — Production-Ready Multi-Tenant SaaS Platform

> **"Turn every enquiry into a follow-up and every follow-up into a customer."**

LeadPilot AI is an AI-powered lead management, qualification, and follow-up platform initially designed for Indian real-estate agencies and brokerages. The application captures leads across multiple channels, qualifies and scores them using AI, schedules and executes multi-channel follow-ups, generates grounded WhatsApp replies without hallucinations, matches requirements to verified inventory, and provides executive business and conversion analytics.

Its domain-agnostic, multi-tenant architecture is engineered for seamless future expansion from real estate into insurance advisory, healthcare clinics, education consulting, interior design firms, and automobile dealerships.

---

### 📚 Dedicated Reference Guides

* 📖 [**Tamil Nadu Land Records (EC, Patta & FMB) Automation Guide**](./LEADPILOT_AI_TN_LAND_RECORDS_AUTOMATION_GUIDE.md) — How to automatically produce, fetch, and solve CAPTCHAs for TNREGINET and e-Services documents.
* 📖 [**Property Inventory Sourcing & AI Matching Guide**](./LEADPILOT_AI_INVENTORY_SOURCING_AND_MATCHING.md) — How inventory is sourced without calling 100+ agents, builder CP portals, reverse WhatsApp bots, and AI grounding.
* 📖 [**Data Flow Architecture & End-to-End Explainer**](./LEADPILOT_AI_DATA_FLOW_AND_EXPLAINER.md) — How data enters via website widgets, WhatsApp, Facebook ads, and phone calls.
* 📖 [**Market Landscape & Competitor Benchmark**](./LEADPILOT_AI_MARKET_LANDSCAPE.md) — Feature matrix vs. Sell.do, LeadSquared, PropFlo, Relata, and Wati.
* 📖 [**Full Product Architecture & Schema Reference**](./LEADPILOT_AI_README.md) — Multi-tenant database design, RBAC, and API endpoints.

---

## 1. Architecture Summary

LeadPilot AI employs a modular, layered architecture built for enterprise multi-tenancy, strict server-side authorization, and multi-provider AI grounding:

```
c:\Analysis\
├── app/                        # Next.js 14 App Router (Pages, Layouts, API Routes, Widgets)
│   ├── (auth)/                 # Registration, Login, Session handlers
│   ├── dashboard/              # Executive KPI Dashboard & Funnel Analytics
│   ├── leads/                  # CRM Lead Management, Filters & CRM Detail View
│   │   └── [id]/               # Comprehensive Lead CRM Profile & AI Workspace
│   ├── followups/              # Multi-channel Follow-up Scheduler Engine
│   ├── properties/             # Verified Real Estate Inventory Catalog
│   ├── analytics/              # Channel Conversion Performance & ROI Tracking
│   ├── ai-assistant/           # Conversational AI Agent with Controlled Tools
│   ├── team/                   # Role-Based Access Control & Member Invitations
│   ├── settings/               # Business Profile, AI Tuning & Subscriptions
│   ├── embed-demo/             # Live External Website Lead Capture Demo
│   └── api/                    # Secure API Endpoints (Strictly scoped by organizationId)
│       ├── auth/               # Register, Login, Logout, Me
│       ├── leads/              # Lead CRUD, Status, Assign, AI Analyze, Reply, Matching
│       ├── followups/          # Follow-up scheduling and status updates
│       ├── properties/         # Verified Inventory CRUD
│       ├── analytics/          # Multi-channel conversion metrics & pipeline value
│       ├── ai-assistant/       # Controlled tool execution engine
│       ├── team/               # User and role management
│       ├── settings/           # Organization settings & AI configuration
│       ├── subscriptions/      # Razorpay checkout & subscription tracking
│       ├── public/             # Public lead capture endpoint (CORS, Rate limited, Anti-spam)
│       ├── widget/             # Embeddable JavaScript widget script (leadpilot.js)
│       └── webhooks/           # Razorpay & WhatsApp Cloud API webhooks
├── components/                 # UI components, Modals, Badges, Sidebars, Headers
│   ├── ui/badge.tsx            # Accessible Status, Priority, and AI Score Badges
│   ├── sidebar.tsx             # Linear/Attio-inspired dark sidebar navigation
│   ├── header.tsx              # Top bar with notification center and AI shortcut
│   ├── add-lead-modal.tsx      # Modal for manual lead entry with AI qualification
│   └── csv-import-modal.tsx    # CSV upload, preview mapping & deduplication guard
├── lib/
│   ├── auth.ts                 # JWT / Session management with jose & bcryptjs
│   ├── rbac.ts                 # Server-side Role Permissions (OWNER, ADMIN, MANAGER, SALES_USER)
│   ├── tenant.ts               # Strict multi-tenant isolation query scoping
│   ├── prisma.ts               # Prisma ORM client singleton
│   └── validations/            # Zod validation schemas for AI & Lead capture
├── services/
│   ├── ai/                     # AI Provider Abstraction (Gemini, OpenAI, Claude, Mock)
│   ├── property-matching/      # Deterministic DB filtering & compatibility scoring
│   ├── csv-import/             # File parsing, header mapping & duplicate detection
│   ├── payment/                # Razorpay subscription provider & HMAC signature verification
│   ├── whatsapp/               # Meta WhatsApp Business Cloud API & Webhooks
│   ├── email/                  # Amazon SES v2 Email abstraction
│   └── audit/                  # Enterprise Audit Logging & Activity Trail
├── prisma/
│   ├── schema.prisma           # Production PostgreSQL Schema (AWS RDS / Supabase)
│   └── schema.sqlite.prisma    # Zero-config local development schema
├── scripts/
│   └── seed.mjs                # Realistic seed: "Chennai Prime Realty" (5 users, 20 properties, 50 leads)
└── tests/                      # Automated Vitest Suite (Isolation, RBAC, AI validation, Webhooks)
```

---

## 2. Database Schema Explanation

The application uses Prisma ORM targeting PostgreSQL for AWS RDS / Supabase / Neon (and provides a local SQLite schema for instant offline development):

| Model | Purpose | Indexes & Isolation |
| :--- | :--- | :--- |
| **`Organization`** | Root tenant entity (Business name, type `REAL_ESTATE`, city, currency `INR`). | `slug` (unique) |
| **`User`** | User credentials with RBAC roles (`OWNER`, `ADMIN`, `MANAGER`, `SALES_USER`). | `[organizationId, email]` (unique), `[organizationId, role]` |
| **`Lead`** | Customer enquiries, requirements, budget range, BHK preference, qualification status (`NEW`, `CONTACTED`, `QUALIFIED`, `FOLLOW_UP`, `SITE_VISIT`, `NEGOTIATION`, `CONVERTED`, `LOST`), and 0–100 AI lead score. | `organizationId`, `[organizationId, status]`, `[organizationId, assignedUserId]`, `[organizationId, createdAt]`, `[organizationId, nextFollowUpAt]`, `[organizationId, phone]` |
| **`AiAnalysis`** | Structured AI extraction (`summary`, `intent`, `bedrooms`, `budgetMin`, `budgetMax`, `urgency`, `leadScore`, `missingInformation`, `recommendedNextAction`) validated via Zod. | `[organizationId]`, `leadId` (unique) |
| **`FollowUp`** | Multi-channel tasks (`CALL`, `WHATSAPP`, `EMAIL`, `TASK`) scheduled and tracked across agents (`PENDING`, `COMPLETED`, `CANCELLED`, `SKIPPED`). | `organizationId`, `[organizationId, scheduledAt]`, `[organizationId, status]` |
| **`Property`** | Verified database inventory used for deterministic matching (preventing AI hallucinations of pricing or availability). | `organizationId`, `[organizationId, city, status]`, `[organizationId, price]` |
| **`Subscription`** | Tiered subscription tracking (`STARTER`, `GROWTH`, `BUSINESS`) with monthly lead quotas. | `organizationId` (unique) |
| **`PlanConfig`** | Database-backed plan pricing and feature configurations. | `plan` (unique) |
| **`Notification`** | In-app notification center for new leads, hot leads, and overdue follow-ups. | `[organizationId, userId]`, `[organizationId, isRead]` |
| **`AuditLog`** | Immutable audit trail for all business actions (`USER_LOGIN`, `LEAD_CREATED`, `LEAD_STATUS_CHANGED`, `AI_ANALYSIS_CREATED`, `SUBSCRIPTION_CHANGED`). | `organizationId`, `[organizationId, createdAt]` |
| **`AiAudit`** | Token consumption, prompt, model, and execution duration audit records. | `organizationId` |

---

## 3. Environment Variables

Documented in `.env.example`:

```env
# Database (PostgreSQL for AWS RDS, Supabase, Neon or local)
DATABASE_URL="file:./dev.db" # Or "postgresql://postgres:password@localhost:5432/leadpilot?schema=public"

# Auth / Session Secret (Min 32 characters)
AUTH_SECRET="leadpilot-super-secure-jwt-secret-key-at-least-32-chars-long"

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# AI Provider ("GEMINI" | "OPENAI" | "CLAUDE" | "MOCK")
AI_PROVIDER="MOCK"
GEMINI_API_KEY=""
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""

# Payments: Razorpay ("RAZORPAY" | "MOCK")
PAYMENT_PROVIDER="MOCK"
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
RAZORPAY_WEBHOOK_SECRET=""

# Messaging: WhatsApp Business Cloud API ("WHATSAPP" | "MOCK")
WHATSAPP_PROVIDER="MOCK"
WHATSAPP_PHONE_NUMBER_ID=""
WHATSAPP_ACCESS_TOKEN=""
WHATSAPP_VERIFY_TOKEN="leadpilot_verify_token_secure"

# Email: Amazon SES ("SES" | "MOCK")
EMAIL_PROVIDER="MOCK"
AWS_REGION="ap-south-1"
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
EMAIL_FROM="notifications@leadpilot.ai"

# S3 Compatible Storage (AWS S3, Cloudflare R2)
S3_ENDPOINT=""
S3_BUCKET_NAME="leadpilot-uploads"
S3_ACCESS_KEY=""
S3_SECRET_KEY=""
S3_REGION="ap-south-1"
```

---

## 4. Local Setup Instructions

Launch locally with zero external dependencies:

```bash
# 1. Install dependencies
npm install

# 2. Synchronize database schema & seed demo organization
npm run db:push:sqlite
npm run db:seed

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Pre-configured Demo Organization: **"Chennai Prime Realty"**
- **Owner**: `suresh@chennaiprimerealty.com` / `Leadpilot@123`
- **Admin**: `deepa@chennaiprimerealty.com` / `Leadpilot@123`
- **Manager**: `venkatesh@chennaiprimerealty.com` / `Leadpilot@123`
- **Sales User**: `karthik@chennaiprimerealty.com` / `Leadpilot@123`
- **Sales User**: `ananya@chennaiprimerealty.com` / `Leadpilot@123`

*(You can also use the one-click demo credentials buttons on `/login` to sign in instantly)*

---

## 5. Test Instructions & Verification

Run the automated test suite:

```bash
npm run test
```

### Verified Test Suites (13/13 Passing):
- **Multi-Tenant Isolation & RBAC** (`tests/auth-isolation.test.ts`):
  - Verifies query filter strictly requires `organizationId`.
  - Verifies `SALES_USER` cannot manage team, billing, or delete leads.
  - Verifies `OWNER` administrative permissions.
- **AI Schema Validation** (`tests/ai-schema.test.ts`):
  - Validates `LeadAnalysisSchema` parsing and rejects malformed intents or out-of-bounds scores.
  - Validates Indian real estate enquiry extraction.
- **CSV Bulk Import & Deduplication** (`tests/csv-import.test.ts`):
  - Tests parsing, column mapping, and error resilience.
- **Webhook Signature Security** (`tests/webhook.test.ts`):
  - Validates HMAC SHA-256 signature verification for Razorpay and WhatsApp Graph API handshakes.

### Build Verification
Run `npm run build`:
- Compiles with Next.js 14 App Router, TypeScript strict checks, and Tailwind CSS.
- Generates 34 static and dynamic routes with zero compilation warnings or errors.

---

## 6. Key Features Built

1. **Lead Qualification & Scoring**: Zod-validated AI extraction parsing BHK preference, locality, budget, urgency, and calculating a 0–100 lead score.
2. **Grounded AI Reply Generator**: Generates concise WhatsApp responses referencing verified database inventory. Never hallucinates availability or prices.
3. **Follow-up Engine**: Tracks Today's, Overdue, and Upcoming follow-ups across Call, WhatsApp, Email, and Tasks with AI draft generation.
4. **Deterministic Property Matcher**: Database filter and ranking engine showing match scores and specific compatibility reasons.
5. **Channel ROI Analytics**: Conversion rate breakdown per source (`WhatsApp` 6.7%, `Website` 4.1%, etc.) and active financial pipeline value.
6. **Embeddable Lead Capture Widget**: Standalone `<script src=".../api/widget/leadpilot.js" data-org="..."></script>` with anti-spam honeypot, rate limiting, and live test page (`/embed-demo`).
7. **Conversational AI Assistant**: Operates exclusively via controlled server-side tools (`getLeads`, `getOverdueFollowups`, `getProperties`, `getAnalytics`, `generateReply`) with safety confirmation for external actions.
8. **Subscription & Plans**: Database-backed tier configurations (`STARTER`, `GROWTH`, `BUSINESS`) with lead volume enforcement and Razorpay payment integration.

---

## 7. Deployment Instructions

### PostgreSQL (AWS RDS / Supabase / Neon)
1. Set `DATABASE_URL="postgresql://user:password@rds-endpoint:5432/leadpilot?sslmode=require"` in your production environment.
2. Deploy migrations:
   ```bash
   npx prisma migrate deploy --schema=prisma/schema.prisma
   ```

### Hosting (Vercel / Cloudflare Pages / AWS ECS / Amplify)
1. Configure environment variables in the hosting dashboard.
2. Build command: `npm run build`
3. Start command: `npm run start`

---

## 8. Known Limitations & Recommended Next Steps

1. **WhatsApp Cloud API**: Currently implements standard text messages and inbound webhook listeners; WhatsApp rich interactive buttons and media templates can be added as next enhancements.
2. **File Storage**: Object storage abstraction is ready for AWS S3 and Cloudflare R2; local placeholder images are used during demo seeds.
3. **Voice Call Integration**: Can be expanded with Exotel or Twilio for direct Indian click-to-call within CRM.

---

## 9. Competitive Landscape & Market Analysis

### 1. India-Focused Real Estate & WhatsApp CRMs

* **Sell.do**
  * **Website**: [https://www.sell.do](https://www.sell.do/)
  * **What it does**: India’s leading PropTech CRM built exclusively for real estate developers and brokers. It manages multi-channel lead aggregation (99acres, MagicBricks, Facebook, Google), call recording, site-visit tracking, and WhatsApp follow-up automation.

* **LeadSquared Real Estate CRM**
  * **Website**: [https://www.leadsquared.com/industries/real-estate-crm/](https://www.leadsquared.com/industries/real-estate-crm/)
  * **What it does**: Heavily used by Indian developers and large brokerage firms (e.g., Godrej, Casagrand, Sobha) to capture leads from portals, run automated lead scoring, and assign leads to sales agents with WhatsApp drip campaigns.

* **PropFlo AI**
  * **Website**: [https://propflo.ai](https://propflo.ai/)
  * **What it does**: An AI-powered CRM designed for Indian channel partners and brokers. It provides automated lead capture, property matching, customer journeys, and commission management.

* **Relata (formerly TechPartner)**
  * **Website**: [https://www.relata.io](https://www.relata.io/)
  * **What it does**: A suite for Indian real estate sales teams combining conversational AI, predictive lead scoring, digital property brochures, and site-visit scheduling.

* **Wati (WhatsApp Team Inbox & CRM)**
  * **Website**: [https://www.wati.io](https://www.wati.io/)
  * **What it does**: An official Meta WhatsApp Business Solution Provider. While not real-estate exclusive, many Indian agencies integrate Wati to send automated WhatsApp follow-ups, chatbots, and lead broadcasts.

---

### 2. Global AI-First Real Estate Follow-up Platforms

* **Structurely**
  * **Website**: [https://www.structurely.com](https://www.structurely.com/)
  * **What it does**: Uses conversational AI (named "Aisa Holmes") that acts as a 24/7 ISA (Inside Sales Agent). It chats with real estate leads via SMS, qualifies their timeline/budget, and hands hot leads over to agents for calls.

* **Ylopo (AI "Raiya")**
  * **Website**: [https://www.ylopo.com](https://www.ylopo.com/)
  * **What it does**: Known for its AI assistant "Raiya" which nurtures cold and new real estate leads via automated dynamic text messages and property recommendations.

* **Lofty (formerly Chime)**
  * **Website**: [https://lofty.com](https://lofty.com/)
  * **What it does**: An AI-driven CRM with website lead capture widgets, automated smart follow-up plans, and predictive lead scoring.

* **Follow Up Boss**
  * **Website**: [https://www.followupboss.com](https://www.followupboss.com/)
  * **What it does**: Widely considered the gold-standard real estate CRM for lead routing, agent accountability, and follow-up workflows.

---

### 3. How LeadPilot AI Compares

| Feature | Generic Indian CRMs (e.g. Sell.do) | LeadPilot AI |
| :--- | :--- | :--- |
| **Grounded AI Replies** | Mostly canned template messages. | Generates dynamic, conversational drafts referencing **only verified properties** in your database without hallucinations. |
| **Instant Lead Scoring** | Rule-based (e.g., +5 if phone provided). | **AI Intent & Urgency Extraction** using LLM parsing with Zod validation. |
| **Conversational AI Assistant** | Basic keyword search or dashboards. | **Natural Language Copilot** (`/ai-assistant`) using controlled server-side tools. |
| **Multi-Tenant Extensibility** | Locked exclusively to real estate. | Flexible schema engineered for turnkey expansion to Insurance, Clinics, Interior Design, and Auto Dealerships. |
| **Self-Hosted / Multi-Tenant SaaS** | Expensive proprietary closed licenses (₹50,000+ / yr). | **Full ownership of code**, modern Next.js 14 multi-tenant architecture, and low-cost Cloudflare / AWS RDS deployment. |

