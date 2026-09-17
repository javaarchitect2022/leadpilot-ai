# LeadPilot AI — Property Inventory Sourcing, Automation & Matching Guide

> **Core Question Addressed**:  
> *"When a customer messages on WhatsApp asking for a 3BHK apartment in OMR or Medavakkam under ₹1.2 Crore, does LeadPilot AI already have this data? Do I need to manually connect with dozens of agents to get listings, or are there automated and scalable ways to implement inventory?"*

---

## 1. Executive Summary

- **Why Inventory Data is Mandatory**: Generative AI must **never hallucinate** or invent property details, amenities, or pricing. In LeadPilot AI, AI replies are strictly grounded against verified available units stored in the `Property` database table.
- **Do You Need to Call 100+ Individual Brokers?** **NO.** 
  - If you **sell LeadPilot AI as SaaS**, the agency or builder uploads their own listings. You do zero manual work.
  - If you **operate a real estate advisory or brokerage**, you can get access to 3,000+ verified units across an entire city simply by partnering with 5 to 10 top developers as an authorized Channel Partner (CP), or by plugging into B2B inventory networks (Anarock, Square Yards, PropTiger).
  - You can also automate broker listings via a **"Reverse" WhatsApp Ingestion Bot** where local brokers send their listings and Gemini AI auto-extracts the data.

---

## 2. Business Model Distinction: SaaS vs. Brokerage

```
                       ┌────────────────────────────────────────────────────────┐
                       │           WHICH BUSINESS MODEL ARE YOU RUNNING?        │
                       └───────────────────────────┬────────────────────────────┘
                                                   │
                   ┌───────────────────────────────┴───────────────────────────────┐
                   │                                                               │
                   ▼                                                               ▼
        MODEL A: B2B SaaS Provider                                      MODEL B: Advisory / Brokerage
  (You sell software to agencies/builders)                         (You capture buyer leads & close sales)
                   │                                                               │
   • The agency/builder has their own inventory.                   • You partner with top builders (Casagrand, etc.)
   • They log in and upload their units.                           • Or plug into B2B CP networks (Anarock).
   • YOU DO ZERO INVENTORY SOURCING.                               • 2% to 4% commission on every home sold.
```

---

## 3. Four Scalable Ways to Source Inventory Without Calling Agents

```
       ┌───────────────────┬─────────────────────┬───────────────────┬───────────────────┐
       │                   │                     │                   │                   │
       ▼                   ▼                     ▼                   ▼                   ▼
  1. Top 5-10 Builders  2. B2B Aggregators    3. Reverse WhatsApp   4. On-Demand Broker   5. State RERA
  Direct CP Tie-ups     Anarock, Square Yards Ingestion Bot         Broadcast Engine      Registry
  (3,000+ units)        (Single API / App)    (Brokers feed you)    (Finds on demand)     (Public data)
```

### Approach 1: Direct Builder Channel Partner (CP) Tie-ups (Most Lucrative)
In any major Indian city (Chennai, Bangalore, Hyderabad, Pune, Mumbai), **70% to 80% of all primary apartment sales** are built by 10 to 15 Tier-1/Tier-2 developers:
- **Examples**: Casagrand, Prestige Group, Brigade, Godrej Properties, TVS Emerald, Appaswamy, Radiance, Puravankara.

#### How It Works:
1. **Free 1-Day Registration**: You register with the developer's sales office as an authorized Channel Partner (CP).
2. **Weekly Master Inventory Sheet**: Every Monday, the builder's CP desk sends an Excel sheet containing all active projects, available tower/floor units, carpet areas, and updated price sheets.
3. **Upload to LeadPilot**: Upload the Excel file once into LeadPilot via the `/properties` module.
4. **Scale**: With just 5 to 10 builder tie-ups, your CRM immediately has **3,000+ verified units** across prime localities.
5. **Revenue**: When a deal closes, the developer pays a direct Channel Partner commission of **2% to 4%** (₹2 Lakhs to ₹5 Lakhs per sale).

---

### Approach 2: Plug Into B2B Co-Broking & Aggregator Networks
Instead of signing up with developers one-by-one, you can partner with established institutional B2B networks that have already aggregated developer inventory:

| Network | Platform | What They Provide |
|---|---|---|
| **Anarock Astra** | B2B CP Portal & App | Real-time unit availability for 500+ Grade-A developer projects across India. |
| **Square Yards Broker Network** | Edge Platform | Pan-India primary and secondary listings with co-broking commission sharing. |
| **PropTiger / Housing.com** | CP Connect | Developer project inventory, digital brochures, and site-visit scheduling tools. |

---

### Approach 3: Automated "Reverse" WhatsApp Ingestion Bot
Local independent brokers constantly post unit availability in unstructured formats on WhatsApp:
> *"Ready to Move 3BHK in Casagrand First City, Medavakkam. 1560 sqft, East facing, 1.12 Cr all inclusive. Direct client only. Contact 9840012345."*

#### How LeadPilot Automates This:
1. **Dedicated WhatsApp Bot Number**: You give local brokers a number: *"Brokers: WhatsApp your listings here for instant client matching."*
2. **AI Extraction**: LeadPilot's Gemini AI parses the freeform WhatsApp text and converts it to structured data:
   - `Title`: Casagrand First City
   - `Location`: Medavakkam
   - `PropertyType`: Apartment
   - `Bedrooms`: 3
   - `Area`: 1560 sqft
   - `Price`: ₹1,12,00,000
   - `BrokerPhone`: `+919840012345`
3. **Database Insertion**: Automatically inserted into the `Property` table marked with `Source: BROKER_NETWORK`.

---

### Approach 4: On-Demand "Reverse Broadcast" (When You Have 0 Matches)
If a buyer arrives with a rare or specific requirement (e.g., *"Looking for a 4BHK duplex penthouse in Anna Nagar under ₹4.5 Cr"*), and your database has 0 matches:

1. **Detection**: LeadPilot detects 0 matching records in the `Property` table.
2. **AI Broadcast Creation**: Gemini AI drafts an anonymous demand alert:
   > *"URGENT REQUIREMENT: Pre-approved buyer looking for 4BHK Duplex in Anna Nagar under ₹4.5 Cr. Site visit ready this weekend. Direct brokers/owners please WhatsApp 98400XXXXX."*
3. **Distribution**: Automatically broadcast to 3-5 curated real estate broker WhatsApp / Telegram groups.
4. **Match Back**: When brokers reply with matching flats, their listings are ingested into LeadPilot and connected directly to the waiting buyer.

---

### Approach 5: Government RERA Public Project Registries
By law under the Real Estate (Regulation and Development) Act, every ongoing real estate project in India must be registered on the state RERA portal:
- **TNRERA** (Tamil Nadu): [rera.tn.gov.in](https://rera.tn.gov.in/)
- **MahaRERA** (Maharashtra): [maharera.mahaonline.gov.in](https://maharera.mahaonline.gov.in/)
- **K-RERA** (Karnataka): [rera.karnataka.gov.in](https://rera.karnataka.gov.in/)

These public registries list:
- Registered Project Name & Developer
- Exact Location & Survey Numbers
- Number of sanctioned units, floor plans, and completion dates.

---

## 4. How the Database & AI Matching System Works

### 1. Database Schema for Properties (`prisma/schema.prisma`)
LeadPilot stores all inventory in a tenant-isolated relational model:

```prisma
model Property {
  id             String         @id @default(cuid())
  organizationId String
  title          String         // e.g. "Casagrand First City 3BHK"
  description    String?
  location       String         // e.g. "Medavakkam"
  city           String         // e.g. "Chennai"
  price          Float          // e.g. 11500000 (₹1.15 Cr)
  propertyType   String         // e.g. "Apartment"
  bedrooms       Int?           // e.g. 3
  bathrooms      Int?           // e.g. 3
  area           Float?         // e.g. 1485 (sq.ft)
  status         PropertyStatus @default(AVAILABLE) // AVAILABLE, RESERVED, SOLD
  images         String?        // JSON array of image URLs
  amenities      String?        // JSON array: ["Gym", "Pool", "Clubhouse"]
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  organization   Organization   @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  @@index([organizationId, city, status])
  @@index([organizationId, price])
}
```

---

### 2. The AI Grounding Pipeline (`generate-reply/route.ts` & `gemini-provider.ts`)

```
Buyer Message: "Looking for 3BHK near OMR / Medavakkam under 1.2 Cr"
                          │
                          ▼
            [ LeadPilot Extraction Engine ]
             • Location: OMR / Medavakkam
             • BHK: 3
             • BudgetMax: ₹1,20,00,000
                          │
                          ▼
            [ SQL Query on Verified Inventory ]
             SELECT * FROM "Property"
             WHERE status = 'AVAILABLE'
               AND (location ILIKE '%OMR%' OR location ILIKE '%Medavakkam%')
               AND price <= 12000000
               AND bedrooms = 3;
                          │
                          ▼
            [ Found 2 Matches in Database ]
             1. Olympia Opaline, OMR (₹1.15 Cr)
             2. Casagrand First City, Medavakkam (₹1.10 Cr)
                          │
                          ▼
            [ Gemini AI Safety-Grounded Prompt ]
             "STRICT SAFETY RULES:
              1. NEVER invent property information or amenities.
              2. NEVER invent prices or discounts.
              3. Only reference properties explicitly listed in Verified Inventory.
              4. If no matching property, politely acknowledge and ask for move-in timeline."
                          │
                          ▼
            [ Instant WhatsApp Output ]
             "Hi Ramesh! We have 2 verified 3BHK units matching your requirement:
              1. Olympia Opaline, OMR (₹1.15 Cr, Ready to Move)
              2. Casagrand First City, Medavakkam (₹1.10 Cr, Clubhouse Facing)
              Can I send you the floor plan and arrange a site visit this Saturday?"
```

---

## 5. Summary Table: Sourcing Methods Compared

| Sourcing Method | Speed to Setup | Volume of Units | Verified Quality | Human Effort |
|---|:---:|:---:|:---:|:---:|
| **Direct Builder CP Portal** | 1–2 Days | 3,000+ Units | 100% Verified | Low (1 Excel upload / week) |
| **B2B Network (Anarock/PropTiger)** | Immediate | 10,000+ Units | 100% Verified | Very Low (1 partnership agreement) |
| **Reverse WhatsApp Bot** | Automated | Continuous | Moderately Verified | Zero (AI parses unformatted broker texts) |
| **Reverse Broker Broadcast** | On-Demand (<15m) | 5–10 Targeted Units | Broker Verified | Low (1 broadcast message) |
| **Individual Agent Calling** | Very Slow | Low | Unreliable | Very High (Not recommended) |

---

## 6. How to Get Started in LeadPilot AI Right Now

1. **Explore the Pre-Seeded Inventory**:
   - Navigate to `http://localhost:3000/properties`.
   - 20 verified Chennai properties are already loaded for immediate testing.
2. **Add a New Unit Manually**:
   - Click **"+ Add Property"** on `/properties`.
   - Enter your project name, location, price, and BHK to test instant matching.
3. **Test with AI WhatsApp Reply**:
   - Go to `/leads/lead_01` (or any lead), click **"Generate Grounded Reply"**.
   - Watch how the AI automatically embeds real matching properties into the conversation.

