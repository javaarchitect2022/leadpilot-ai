# Deploying LeadPilot AI to Cloudflare Environment
> **Complete Production Deployment Guide & Architectural Perspectives**

---

## 1. Executive Summary & Architecture Perspectives

Deploying **LeadPilot AI** to Cloudflare combines enterprise-grade edge acceleration, global Anycast DNS, DDoS mitigation, and Zero Trust security with our Next.js 14 multi-tenant real estate intelligence platform.

### System Architecture Overview
```mermaid
flowchart TD
    Client["Client / Browser / Mobile"] -->|"HTTPS (Anycast DNS)"| CF_Edge["Cloudflare Global Network (Edge)"]
    
    subgraph CF_Security["Cloudflare Edge Security & Services"]
        WAF["Web Application Firewall (WAF) & Rate Limiting"]
        SSL["Automated SSL/TLS (Full Strict)"]
        Cache["Edge Cache (_next/static, images)"]
        Access["Cloudflare Zero Trust Access (SSO for /docs)"]
    end
    
    CF_Edge --> CF_Security
    
    subgraph Ingress["Ingress Strategy"]
        Tunnel["Cloudflare Tunnel (cloudflared)<br/>No Open Inbound Ports / Encrypted WireGuard"]
    end
    
    CF_Security --> Tunnel
    
    subgraph AppServer["LeadPilot AI Production Container"]
        NextJS["Next.js 14 App Router (Node 20)"]
        Prisma["Prisma ORM Client"]
        Puppeteer["Headless Chromium & Puppeteer<br/>(TNREGINET EC & Patta Engine)"]
        Gemini["Gemini 1.5 Flash Vision OCR<br/>(Optical CAPTCHA Solver)"]
        Storage["Persistent Volume / Cloudflare R2<br/>(PDFs, Patta, FMB Vectors)"]
    end
    
    Tunnel --> NextJS
    NextJS --> Prisma
    NextJS --> Puppeteer
    NextJS --> Gemini
    NextJS --> Storage
    
    subgraph DB["Database Layer"]
        Postgres[("PostgreSQL 16 Database<br/>Neon / Supabase / Cloudflare Hyperdrive / RDS")]
    end
    
    Prisma --> Postgres
```

---

## 2. The Two Cloudflare Deployment Perspectives

When deploying a Next.js 14 application with background browser automation (Puppeteer/Chromium) to Cloudflare, you have two primary architectural routes:

| Architectural Metric | **Strategy 1: Cloudflare Tunnel + Docker (Recommended)** | **Strategy 2: Cloudflare Pages / Workers (Serverless Edge)** |
| :--- | :--- | :--- |
| **Compatibility** | **100% Native Out-of-the-Box** | Requires adapting Node.js APIs to V8 isolates |
| **Puppeteer / Chromium** | Runs natively via containerized Debian Chromium | Requires **Cloudflare Browser Rendering API** binding |
| **Database** | Native PostgreSQL with full Prisma Client | PostgreSQL via **Cloudflare Hyperdrive** or Prisma Accelerate |
| **Document Storage** | Local persistent Docker volume or Cloudflare R2 | **Cloudflare R2** (S3-compatible object storage) |
| **Security Posture** | Zero open ports, no public IP, Cloudflare WAF + Tunnel | Direct edge serverless execution |
| **Setup Time** | **< 10 minutes** | 30–60 minutes |

> [!TIP]
> **Recommended Production Path**: **Strategy 1 (Cloudflare Tunnel + Docker)** is the industry standard for Next.js applications featuring headless Puppeteer and complex Prisma workloads. It gives you 100% compatibility with all Tamil Nadu Government automated connectors while leveraging Cloudflare's entire edge infrastructure for DNS, SSL, WAF, and DDoS mitigation.

---

## 3. Prerequisites

Before beginning deployment, ensure you have:
1. **Cloudflare Account**: [dash.cloudflare.com](https://dash.cloudflare.com/)
2. **Domain registered or added to Cloudflare** (e.g., `yourdomain.com` with active Cloudflare nameservers).
3. **Server / VPS / Cloud Host** (Ubuntu 22.04 LTS / Debian 12 / AWS EC2 / DigitalOcean Droplet / Hetzner) with **Docker & Docker Compose** installed.
4. **Google Gemini API Key** (for AI Assistant and TNREGINET CAPTCHA Vision OCR).
5. **Node.js 20+** (if running migrations locally).

---

## 4. Strategy 1: Step-by-Step Deployment (Cloudflare Tunnel + Docker)

### Step 1: Create a Cloudflare Tunnel
1. Log in to the [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/).
2. In the sidebar, navigate to **Networks** $\rightarrow$ **Tunnels**.
3. Click **Add a tunnel** $\rightarrow$ select **Cloudflared** $\rightarrow$ click **Next**.
4. Name your tunnel: `leadpilot-production-tunnel`.
5. Under **Choose an environment**, note the **Tunnel Token** provided in the install snippet:
   ```bash
   eyJhIjoiY2... (Copy this token)
   ```
6. Under the **Public Hostname** tab:
   - **Subdomain**: `leadpilot` (or `@` for root domain)
   - **Domain**: `yourdomain.com`
   - **Type**: `HTTP`
   - **URL**: `leadpilot-app:3000` (or `localhost:3000` if not using Docker network)
7. Click **Save tunnel**.

---

### Step 2: Configure Environment Variables

On your deployment server, create the production environment file:
```bash
cp .env.example .env.production
```

Edit `.env.production` with your live credentials:
```ini
# ==============================================================================
# LeadPilot AI — Production Environment Configuration
# ==============================================================================

# 1. Database Configuration (PostgreSQL)
DATABASE_URL="postgresql://leadpilot_user:YourStrongPassword123!@postgres:5432/leadpilot?schema=public"
POSTGRES_USER="leadpilot_user"
POSTGRES_PASSWORD="YourStrongPassword123!"
POSTGRES_DB="leadpilot"

# 2. Application Core Security
AUTH_SECRET="your-super-secret-jwt-key-at-least-32-characters-minimum"
NEXT_PUBLIC_APP_URL="https://leadpilot.yourdomain.com"
PORT=3000

# 3. Google Gemini AI & Vision OCR Engine
AI_PROVIDER="GEMINI"
GEMINI_API_KEY="AIzaSyYourProductionGeminiKeyHere"

# 4. Cloudflare Zero Trust Tunnel Token
CLOUDFLARE_TUNNEL_TOKEN="eyJhIjoiY2..."

# 5. Business Connectors (Optional)
PAYMENT_PROVIDER="MOCK"       # Change to "RAZORPAY" when ready
WHATSAPP_PROVIDER="MOCK"      # Change to "WHATSAPP" with Meta Cloud API token
EMAIL_PROVIDER="MOCK"         # Change to "SES" with AWS credentials
```

---

### Step 3: Run Database Migrations & Seeds

Before launching the web server, initialize your PostgreSQL database schema:

```bash
# Start PostgreSQL database service only
docker compose --env-file .env.production up -d postgres

# Wait 5 seconds for PostgreSQL to be healthy, then push schema:
docker compose --env-file .env.production run --rm leadpilot-app npx prisma db push

# (Optional) Seed initial demo properties & TN jurisdiction mappings:
docker compose --env-file .env.production run --rm leadpilot-app node scripts/seed-tn-jurisdiction.ts
```

---

### Step 4: Launch Full Application Stack

Start all containers in detached mode:
```bash
docker compose --env-file .env.production up -d --build
```

Verify all services are running and healthy:
```bash
docker compose ps
```
You should see:
```text
NAME                IMAGE                        COMMAND                  SERVICE             STATUS
leadpilot-db        postgres:16-alpine           "docker-entrypoint.s…"   postgres            healthy (Up)
leadpilot-web       leadpilot-ai-leadpilot-app   "npm start"              leadpilot-app       healthy (Up)
leadpilot-tunnel    cloudflare/cloudflared       "tunnel run"             cloudflared         Up
```

Check the tunnel logs to confirm edge connection:
```bash
docker compose logs -f cloudflared
```
Expected output:
```text
INF Connection registered with Cloudflare edge id=... location=maa (Chennai/India)
INF Registered tunnel connection
```

---

## 5. Strategy 2: Serverless Cloudflare Pages & R2 Deployment

If your organization mandates 100% serverless hosting directly inside Cloudflare Workers:

### Architecture Modifications Needed
1. **Database**: Use **Cloudflare Hyperdrive** to proxy connections to Neon or Supabase PostgreSQL:
   ```bash
   npx wrangler hyperdrive create leadpilot-db --connection-string="postgres://user:pass@ep-xyz.neon.tech/leadpilot"
   ```
2. **Object Storage**: Create a Cloudflare R2 bucket for generated documents:
   ```bash
   npx wrangler r2 bucket create leadpilot-documents
   ```
3. **Browser Automation**: Bind the **Cloudflare Browser Rendering API**:
   In `wrangler.toml`:
   ```toml
   name = "leadpilot-ai"
   compatibility_flags = ["nodejs_compat"]
   compatibility_date = "2026-09-01"

   [browser]
   binding = "MYBROWSER"

   [[r2_buckets]]
   binding = "DOCUMENTS_BUCKET"
   bucket_name = "leadpilot-documents"

   [[hyperdrive]]
   binding = "HYPERDRIVE"
   id = "<your-hyperdrive-id>"
   ```
4. **Build & Deploy**:
   ```bash
   npm install -D @cloudflare/next-on-pages
   npx @cloudflare/next-on-pages
   npx wrangler pages deploy .vercel/output/static
   ```

---

## 6. Cloudflare Edge Performance & Security Rules

To maximize security and speed, configure these settings in your [Cloudflare Dashboard](https://dash.cloudflare.com/):

### 1. SSL/TLS Settings
- Navigate to **SSL/TLS** $\rightarrow$ **Overview**.
- Set encryption mode to **Full (Strict)**.
- Under **Edge Certificates**, enable:
  - **Always Use HTTPS** $\rightarrow$ `ON`
  - **Minimum TLS Version** $\rightarrow$ `TLS 1.2`
  - **Opportunistic Encryption** $\rightarrow$ `ON`
  - **HTTP/3 (with QUIC)** $\rightarrow$ `ON`

### 2. Edge Caching Rules
Create a Cache Rule to cache immutable Next.js static assets globally:
- Navigate to **Caching** $\rightarrow$ **Cache Rules** $\rightarrow$ **Create Rule**:
  - **Rule Name**: `Cache NextJS Static Assets`
  - **Expression**: `(http.request.uri.path contains "/_next/static/")`
  - **Cache Eligibility**: Eligible for cache
  - **Edge TTL**: 1 Month
  - **Browser TTL**: 1 Month

### 3. WAF Rate Limiting Rules
Protect authentication and government API routes from brute-force queries:
- Navigate to **Security** $\rightarrow$ **WAF** $\rightarrow$ **Rate Limiting Rules**:
  - **Rule 1 (Login Route)**:
    - URI Path: `/api/auth/login`
    - Rate: 10 requests per 1 minute
    - Action: Managed Challenge
  - **Rule 2 (TN Land Records Scraping)**:
    - URI Path: `/api/properties/*/legal/fetch-govt-docs`
    - Rate: 15 requests per 1 minute
    - Action: Block or Interactive Challenge

### 4. Zero Trust Protection for API Docs / Swagger
If you wish to restrict interactive Swagger documentation (`/docs`, `/api-docs`) to internal employees:
1. In Cloudflare Zero Trust, go to **Access** $\rightarrow$ **Applications**.
2. Click **Add an Application** $\rightarrow$ **Self-hosted**.
3. **Application Domain**: `leadpilot.yourdomain.com/api-docs` and `leadpilot.yourdomain.com/docs`.
4. Add Policy: Require email ending in `@yourcompany.com` via Google/GitHub OAuth.

---

## 7. Post-Deployment Verification Checklist

Once deployed through Cloudflare, verify all system features end-to-end:

| Feature | URL to Verify | Expected Result |
| :--- | :--- | :--- |
| **Edge Ingress & SSL** | `https://leadpilot.yourdomain.com/login` | Renders clean 200 OK with Cloudflare SSL certificate |
| **Interactive Swagger UI** | `https://leadpilot.yourdomain.com/docs` | Swagger console loads and displays all 47 endpoints |
| **OpenAPI Spec Rewrite** | `https://leadpilot.yourdomain.com/api/openapi.json` | Returns valid OpenAPI 3.0.3 specification JSON |
| **Properties Management** | `https://leadpilot.yourdomain.com/properties` | Shows listing inventory and legal status badges |
| **TN Jurisdiction API** | `https://leadpilot.yourdomain.com/api/govt/tn/jurisdiction?action=zones` | Returns 9 official registration zones (`Salem`, `Chennai`, etc.) |
| **TNREGINET 1B1B Generation** | Test via Swagger or Legal Checklist modal | Produces Schedule 2 with `3270 sq.ft` and `Rs. 4,38,456/-` |
| **Document Deletion API** | `DELETE /api/properties/{id}/documents` | Deletes bad documents and restores checklist status to PENDING |

---

## 8. Troubleshooting & Operational Guide

### Q1: `cloudflared` reports "Unable to reach the origin service"
- **Cause**: The container name in the tunnel config does not match Docker's network, or the Next.js app is still booting.
- **Fix**: In Cloudflare Tunnel Public Hostname configuration, use `leadpilot-app:3000` (the service name defined in `docker-compose.yml`) instead of `localhost:3000`.

### Q2: Puppeteer crashes with `Chromium revision is not available`
- **Cause**: Puppeteer tried to download Chromium dynamically at runtime inside an unprivileged container.
- **Fix**: Our `Dockerfile` automatically installs `chromium` via apt and sets `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium`. Ensure you build the container using our provided `Dockerfile`.

### Q3: How to view live logs in production?
```bash
# View Next.js application logs
docker compose logs -f leadpilot-app

# View Cloudflare Tunnel traffic logs
docker compose logs -f cloudflared

# View PostgreSQL logs
docker compose logs -f postgres
```

### Q4: How to update LeadPilot AI when new code is committed?
```bash
# Pull latest code
git pull origin main

# Rebuild and restart with zero downtime
docker compose --env-file .env.production up -d --build --no-deps leadpilot-app
```

---

*LeadPilot AI — Production-grade deployment guide for Cloudflare Edge Infrastructure.*

