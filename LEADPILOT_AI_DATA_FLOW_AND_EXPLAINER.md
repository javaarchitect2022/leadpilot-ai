# LeadPilot AI — Core Purpose & End-to-End Data Flow Architecture

A brief, plain-English explainer of **what LeadPilot AI is for** and an end-to-end breakdown of **where and how data flows** through the system and external platforms.

---

## 1. In Brief: What is LeadPilot AI For?

Real estate agencies spend thousands of rupees on Google ads, Facebook ads, and property portals (99acres, MagicBricks). However:
* Most enquiries arrive as vague messages (*"2BHK near Tambaram under 70L"*, *"send brochure"*).
* Sales agents take hours or days to respond.
* When agents do respond, they often forget follow-ups or quote inaccurate prices.

### **What LeadPilot AI Does:**
LeadPilot AI is an **intelligent sales copilot and CRM** that sits between incoming customer enquiries and sales agents. 

1. **Catches every enquiry immediately** (from website popups, WhatsApp messages, social ads, and CSV uploads).
2. **Uses AI to qualify and score the lead in seconds** (determining exact BHK preference, budget, locality, and whether the buyer is urgent or just browsing).
3. **Matches the buyer against real database properties** (never inventing listings or hallucinating prices).
4. **Drafts ready-to-send WhatsApp replies** in natural Indian English for the sales agent.
5. **Enforces follow-up discipline** with daily reminders for calls, site visits, and WhatsApp check-ins.

> **In one sentence:** LeadPilot AI turns raw property enquiries into qualified, scored leads with ready-to-send WhatsApp replies and automated follow-up schedules.

---

## 2. End-to-End Data Flow Architecture

Here is the exact journey of customer data from the moment an enquiry is submitted until deal conversion:

```
[Inbound Sources]
 ├── Website Widget (<script src=".../leadpilot.js">)
 ├── WhatsApp Cloud API (Incoming chat)
 ├── Portal / Ad Webhooks (Facebook, Google Form)
 ├── CSV Bulk Upload
 └── Manual Sales Agent Entry
             │
             ▼
[Step 1: Security & Ingestion Layer]
 ├── Rate Limiting (IP check)
 ├── Anti-Spam Honeypot Check (_hp_check)
 └── Multi-Tenant Validation (Verify organizationId exists)
             │
             ▼
[Step 2: AI Qualification Engine (services/ai)]
 ├── Raw enquiry message passed to Gemini / Mock Provider
 ├── Prompt extracts: Intent (BUY/RENT), BHK, Locality, Budget (Min/Max), Urgency
 ├── Zod Schema strictly validates JSON (rejection if invalid)
 └── Computes Lead Score (0 - 100)
             │
             ▼
[Step 3: Database & Tenant Isolation (prisma/schema.prisma)]
 ├── Writes record to 'Lead' table (Scoped with organizationId)
 ├── Writes record to 'AiAnalysis' table
 ├── Writes record to 'Activity' timeline
 └── Generates 'Notification' alert to assigned sales agent
             │
             ▼
[Step 4: Deterministic Inventory Matcher (services/property-matching)]
 ├── Queries real 'Property' table for available units
 ├── Compares location, BHK, and budget (15% negotiation tolerance)
 └── Produces match score (e.g. 95%) and exact reasons
             │
             ▼
[Step 5: Grounded WhatsApp Reply Generator]
 ├── Feeds lead requirements + matched real properties to AI
 ├── Enforces NO-HALLUCINATION rule (strictly uses DB prices/inventory)
 └── Stores editable WhatsApp draft in CRM
             │
             ▼
[Step 6: Follow-up & Outreach Execution]
 ├── Schedules Follow-up in 'FollowUp' table (Call / WhatsApp / Site Visit)
 ├── Agent clicks WhatsApp button -> Opens WhatsApp with pre-filled draft
 └── Reminders trigger in In-app Notification Center
             │
             ▼
[Step 7: Analytics & Executive Funnel]
 └── Updates Channel Conversion Performance (WhatsApp %, Website %) and Pipeline Value
```

---

## 3. Do We Need Separate User Interfaces? (No! Everything Runs in ONE Dashboard)

> **Important Clarification:** You do **NOT** need any separate user interface or multiple websites. Everything runs inside **ONE single unified web application** at `http://localhost:3000`.

### Why is it called "Components"?
In software engineering, the word *"component"* refers to **background code modules running behind the scenes** (such as a database query, an internal API route, or a background AI helper function). It does **NOT** mean separate screens or separate software for your sales team.

### How It Works in Real Life (All Inside One Dashboard):

```
                  ┌─────────────────────────────────────────┐
                  │    LeadPilot AI (ONE Single Website)    │
                  │        http://localhost:3000            │
                  └────────────────────┬────────────────────┘
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        ▼                              ▼                              ▼
  [ Leads Page ]             [ Lead CRM Detail ]             [ Follow-up Engine ]
  All customer enquiries     Click any lead to see           Daily checklist:
  show up in one table       AI qualification and            Calls to make today,
  automatically.             click "Send WhatsApp".          overdue follow-ups.
```

### How Each Part Connects Into Your Single Dashboard:

| Feature / Part | Do you need a separate UI? | How it actually works |
| :--- | :---: | :--- |
| **"Website Embed Widget"** | **NO** | It is just a **1-line copy-paste code snippet** for an agency's marketing landing page (like a Google Analytics tag). When a buyer fills it on any website, the lead immediately lands in your single LeadPilot **Leads table**! |
| **"WhatsApp"** | **NO** | Inside each lead's profile in your dashboard, there is simply a green **"WhatsApp"** button. Clicking it opens WhatsApp with the AI-crafted reply already pre-filled! |
| **"AI Qualification"** | **NO** | The AI runs automatically in the background. When an enquiry arrives, the AI scores it (0–100) and displays the badge directly on the lead's card in your dashboard. |
| **"CSV Import"** | **NO** | It is a built-in popup modal right inside your Leads page when you click the **"Import CSV"** button. |

---

## 4. Where Data Flows Through Behind the Scenes (Technical Breakdown)

### A. The Website Embed Widget (`/api/widget/leadpilot.js`)
* **Where data starts**: A visitor on an agency's website clicks the floating *"💬 Enquire Property"* button.
* **Where it travels**: The form sends a secure `POST` request to `/api/public/leads`.
* **Spam prevention**: A hidden honeypot field catches automated bots; human submissions pass through.
* **Where it lands**: Saved directly into the agency's isolated database partition with instant AI scoring.

### B. WhatsApp Business Cloud API (`/api/webhooks/whatsapp`)
* **Where data starts**: A customer sends a message to the agency's official WhatsApp Business number.
* **Where it travels**: Meta's Graph API sends a webhook payload to LeadPilot AI.
* **Processing**: The system checks the phone number against existing CRM leads. If new, it creates a lead; if existing, it appends the message to their activity timeline and triggers AI re-qualification.

### C. The AI Processing Layer (`services/ai/`)
* **Where data goes**: The raw customer text is sent via encrypted HTTPS to Google Gemini API (or the local deterministic Mock Provider if offline).
* **Validation boundary**: The raw response is parsed through **Zod**. If the AI returns non-compliant fields or hallucinations, the Zod validator catches and corrects it before saving.
* **Privacy**: Only the enquiry text and agency context are processed; no cross-tenant information is ever sent.

### D. The Database Storage Layer (`prisma/schema.prisma`)
* **Where data lives**: PostgreSQL (e.g., AWS RDS / Supabase) or local SQLite (`dev.db`).
* **Tenant Isolation**: Every table (`Lead`, `AiAnalysis`, `FollowUp`, `Property`, `Activity`, `AuditLog`) has an `organizationId` column. No query can read or write data across organizations.

### E. The Sales Outreach Layer
* **Where data goes out**:
  * **WhatsApp Web / Mobile**: The CRM generates deep links (`https://wa.me/<phone>?text=<draft>`) allowing sales agents to send verified drafts with 1 click.
  * **Email (Amazon SES)**: Dispatches transactional invites and notifications.
  * **Payments (Razorpay)**: Subscription checkout sessions and webhook verification.

---

## 5. Summary Comparison: Where Data Flows in Other Tools vs. LeadPilot AI

| Platform | Inbound Flow | AI Processing | Outbound Flow |
| :--- | :--- | :--- | :--- |
| **Sell.do** | Portals + Call Telephony | Basic keyword filters & manual scoring | Telephony call recordings + static templates |
| **LeadSquared** | Portals + Webhooks | Rule-based lead routing triggers | Drip email campaigns + WhatsApp templates |
| **LeadPilot AI** | Website Widget + WhatsApp API + CSV + Manual | **LLM Intent Extraction + Zod Validation + Grounded DB Matching** | **Dynamic WhatsApp drafts referencing real database inventory + Scheduled Follow-ups** |

---

## 6. Related Technical Guides

* 📖 [**Property Inventory Sourcing & AI Matching Guide**](./LEADPILOT_AI_INVENTORY_SOURCING_AND_MATCHING.md) — How inventory is loaded, builder CP partnerships, B2B networks, and anti-hallucination matching.
* 📖 [**LeadPilot AI Market Landscape & Competitor Benchmark**](./LEADPILOT_AI_MARKET_LANDSCAPE.md) — Detailed comparison with Sell.do, LeadSquared, PropFlo, and Wati.
* 📖 [**Full Product Architecture & Schema Reference**](./LEADPILOT_AI_README.md) — Database schema, tenant isolation, and API routes.

