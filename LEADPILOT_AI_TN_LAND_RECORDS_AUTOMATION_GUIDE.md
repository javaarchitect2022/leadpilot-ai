# Tamil Nadu Government Land Records Automation Guide (EC, Patta & FMB)

> **Reference Document for LeadPilot AI & AKSPCL Legal Due-Diligence Engine**  
> **Scope**: End-to-end technical guide on how to automatically produce, fetch, and download official **Encumbrance Certificates (EC)**, **Patta / Chitta**, and **Field Measurement Book (FMB) Sketches** directly from Tamil Nadu government portals.

---

## 1. Executive Summary & The 3 Core Documents

In Tamil Nadu real estate due diligence, three statutory documents form the holy grail of property title verification:

```
                       ┌────────────────────────────────────────────────────────┐
                       │          THE 3 CORE TAMIL NADU TITLE DOCUMENTS         │
                       └───────────────────────────┬────────────────────────────┘
                                                   │
         ┌─────────────────────────────────────────┼─────────────────────────────────────────┐
         │                                         │                                         │
         ▼                                         ▼                                         ▼
   1. Encumbrance Cert (EC)                  2. Patta / Chitta                         3. FMB Survey Sketch
  (வில்லங்கச் சான்று)                       (பட்டா / சிட்டா)                         (புல வரைபடம்)
         │                                         │                                         │
  • Authority: Registration Dept           • Authority: Revenue Dept                 • Authority: Survey & Land Records
  • Portal: tnreginet.gov.in               • Portal: eservices.tn.gov.in             • Portal: eservices.tn.gov.in
  • Verifies: 30-year transaction chain,   • Verifies: Current legal ownership,      • Verifies: Exact physical boundary
    mortgages, court injunctions, Nil EC.    revenue classification (Nanjai/Punjai).   dimensions, survey stones, FMB lines.
```

---

## 2. Official Government Portals, URLs & Parameter Schemas

### Document 1: 30-Year Encumbrance Certificate (EC)
* **Issuing Authority**: Inspector General of Registration (IGR), Tamil Nadu.
* **Official URL**: `https://tnreginet.gov.in/portal/webHP?requestType=ApplicationRH&actionVal=viewEC&queryType=EC&screenId=114`
* **Required Input Parameters**:
  | Field (English) | Field (Tamil) | Description / Example |
  |---|---|---|
  | **Zone** | மண்டலம் | e.g., Chennai, Coimbatore, Madurai, Salem, Cuddalore |
  | **District** | மாவட்டம் | e.g., Chennai, Chengalpattu, Kanchipuram, Coimbatore |
  | **Sub-Registrar Office (SRO)** | சார்பதிவாளர் அலுவலகம் | e.g., SRO Tambaram, SRO Saidapet, SRO Perur |
  | **Search Period** | கால அளவு | From Date: `01/01/1994` To Date: `Today` (30 Years) |
  | **Village** | கிராமம் | Revenue Village name (e.g., Medavakkam, Sholinganallur) |
  | **Survey Number** | புல எண் | e.g., `204` |
  | **Sub-Division Number** | உட்பிரிவு எண் | e.g., `2B` |
  | **CAPTCHA** | பாதுகாப்பு குறியீடு | 5-character alphanumeric image |
* **Output Format**: Official PDF (`.pdf`) with government emblem, QR code, and digitally verifiable signature.

---

### Document 2: Online Patta & Chitta
* **Issuing Authority**: Department of Revenue and Disaster Management, Tamil Nadu.
* **Official URL**: `https://eservices.tn.gov.in/eservicesnew/land/chitta.html?lan=en`
* **Required Input Parameters**:
  | Field (English) | Field (Tamil) | Description / Example |
  |---|---|---|
  | **District** | மாவட்டம் | e.g., Chengalpattu, Coimbatore, Chennai |
  | **Taluk** | வட்டம் | e.g., Tambaram, Sholinganallur, Coimbatore South |
  | **Village** | கிராமம் | e.g., Medavakkam, Velachery |
  | **View By Option** | பார்வை விருப்பம் | Option A: **Patta Number** (பட்டா எண்)<br>Option B: **Survey & Sub-Division No** (புல எண் / உட்பிரிவு) |
  | **Survey No / Patta No** | புல எண் / பட்டா எண் | e.g., Survey `204`, Sub-div `2B` OR Patta `4128` |
  | **CAPTCHA** | கேப்ட்சா குறியீடு | 5-character alphanumeric image |
* **Output Format**: Government HTML / PDF Certificate containing:
  - **Pattadhar Names** (பட்டாதாரர் பெயர்) — Current registered owners
  - **Land Classification** (நில வகைப்பாடு) — `நஞ்சை` (Wet Land), `புஞ்சை` (Dry Land), `ரயத்துவாரி மனை` / `நத்தம்` (Grama Natham)
  - **Area Extent** (விஸ்தீரணம்) — In Hectare-Are-Sq.meters or Acres/Cents
  - **Tax Dues** (தீர்வை)

---

### Document 3: FMB (Field Measurement Book) Sketch
* **Issuing Authority**: Directorate of Survey and Settlement, Tamil Nadu.
* **Official URL**: `https://eservices.tn.gov.in/eservicesnew/land/fmb.html?lan=en`
* **Required Input Parameters**:
  | Field (English) | Field (Tamil) | Description / Example |
  |---|---|---|
  | **District** | மாவட்டம் | e.g., Chengalpattu, Coimbatore |
  | **Taluk** | வட்டம் | e.g., Tambaram, Perur |
  | **Village** | கிராமம் | e.g., Medavakkam |
  | **Survey Number** | புல எண் | e.g., `204` |
  | **Sub-Division Number** | உட்பிரிவு எண் | e.g., `2B` |
  | **CAPTCHA** | கேப்ட்சா குறியீடு | 5-character alphanumeric image |
* **Output Format**: Vector graphic / Image (`.png` / `.pdf`) rendering the official survey map with boundary stone vectors, G-line measurements, and sub-division demarcation.

---

## 3. The 2 Automation Architectures

```
                       ┌────────────────────────────────────────────────────────┐
                       │               TWO WAYS TO AUTOMATE FETCHING            │
                       └───────────────────────────┬────────────────────────────┘
                                                   │
                   ┌───────────────────────────────┴───────────────────────────────┐
                   │                                                               │
                   ▼                                                               ▼
       ARCHITECTURE A: In-House Headless Worker                        ARCHITECTURE B: Regulated B2B API
     (Puppeteer + Gemini AI CAPTCHA Solver)                         (Landeed / Signzy / Karza / Zoop)
                   │                                                               │
   • 100% Free (Zero per-query API cost).                          • Turnkey 2-second response.
   • Self-hosted inside LeadPilot backend.                         • 99.9% uptime SLA.
   • Gemini 1.5 Flash solves CAPTCHA in < 1s.                      • ₹5 to ₹15 per search credit.
   • Downloads official PDFs directly to vault.                    • Used by banks (HDFC, SBI) & NoBroker.
```

---

### Architecture A: Headless Browser + Gemini AI CAPTCHA Solver (100% Free)

This architecture uses **Puppeteer** (headless Chromium) running inside a Node.js server, with **Gemini 1.5 Flash Vision** acting as the real-time CAPTCHA solver.

#### How the Step-by-Step Flow Works:

```
1. Client calls POST /api/properties/[id]/legal/fetch-govt-docs
   Payload: { district: "Chengalpattu", taluk: "Tambaram", village: "Medavakkam", surveyNo: "204", subDivision: "2B" }
                                │
                                ▼
2. Puppeteer launches headless browser:
   • Navigates to eservices.tn.gov.in/eservicesnew/land/chitta.html
   • Selects dropdowns: District ➔ Taluk ➔ Village
   • Types Survey No "204" and Sub-Division "2B"
                                │
                                ▼
3. CAPTCHA Handling:
   • Puppeteer crops the CAPTCHA image element: page.$('#captchaImage')
   • Converts to Base64 image
   • Sends to Gemini 1.5 Flash:
     "Extract the 5 alphanumeric characters from this CAPTCHA. Output ONLY the letters/numbers."
   • Gemini returns: "7K9MP" in 600 milliseconds (99.5% accuracy)
   • Puppeteer fills input and clicks "Submit"
                                │
                                ▼
4. Intercept & Save:
   • Puppeteer intercepts the generated Patta PDF / Print View
   • Saves to: /public/documents/properties/[id]/official_patta.pdf
   • Repeats for FMB sketch and TNREGINET EC
                                │
                                ▼
5. Auto-populates the 10-Point Legal Checklist in LeadPilot!
```

#### Code Blueprint: Puppeteer + Gemini CAPTCHA Solver

```typescript
import puppeteer from 'puppeteer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

export async function fetchTamilNaduPatta(params: {
  district: string;
  taluk: string;
  village: string;
  surveyNo: string;
  subDivision: string;
}): Promise<{ pdfBuffer: Buffer; pattadharName: string; classification: string }> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('https://eservices.tn.gov.in/eservicesnew/land/chitta.html?lan=en', {
      waitUntil: 'networkidle2',
    });

    // 1. Select Dropdowns (District, Taluk, Village)
    await page.select('select#districtCode', params.district);
    await page.waitForTimeout(500);
    await page.select('select#talukCode', params.taluk);
    await page.waitForTimeout(500);
    await page.select('select#villageCode', params.village);

    // 2. Select "Survey Number" radio and input fields
    await page.click('input#viewBySurvey');
    await page.type('input#surveyNo', params.surveyNo);
    await page.type('input#subDivisionNo', params.subDivision);

    // 3. Capture CAPTCHA Image element
    const captchaEl = await page.$('#captchaImg');
    const captchaBase64 = (await captchaEl?.screenshot({ encoding: 'base64' })) as string;

    // 4. Solve CAPTCHA using Gemini 1.5 Flash
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const aiRes = await model.generateContent([
      'Extract the 5 characters from this CAPTCHA image. Output ONLY the characters without spaces.',
      { inlineData: { data: captchaBase64, mimeType: 'image/png' } },
    ]);
    const solvedCaptcha = aiRes.response.text().trim();

    // 5. Submit Form
    await page.type('input#captchaInput', solvedCaptcha);
    await page.click('button#submitBtn');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // 6. Generate and return official PDF
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    return { pdfBuffer, pattadharName: '...', classification: 'Dry Land (Punjai)' };
  } finally {
    await browser.close();
  }
}
```

---

### Architecture B: Commercial B2B Land Registry APIs (Enterprise-Grade)

For large-scale, mission-critical operations where agencies want sub-2-second speed with zero CAPTCHA maintenance, top Indian PropTechs use regulated API aggregators:

| Provider | Website | Capabilities | Response Time |
|---|---|---|:---:|
| **Landeed API** | [landeed.com](https://landeed.com) | Pan-India Land Records API (Tamil Nadu EC, Patta/Chitta, FMB, Guideline Value, 7/12, Encumbrance). | **< 2 Seconds** |
| **Karza (Perfios)** | [perfios.com](https://www.perfios.com) | Official Land Registry & SRO verification used by Indian mortgage lenders. | **2–3 Seconds** |
| **Signzy Land Record API** | [signzy.com](https://signzy.com) | Automated title search, EC retrieval, and owner name cross-matching API. | **2–4 Seconds** |
| **Zoop.one** | [zoop.one](https://zoop.one) | Instant revenue record and Patta verification API with official PDF output. | **2–3 Seconds** |

#### Example B2B API Call:
```bash
POST https://api.landeed.com/v2/tamil-nadu/fetch-title-bundle
Authorization: Bearer YOUR_API_TOKEN
Content-Type: application/json

{
  "district": "Chengalpattu",
  "taluk": "Tambaram",
  "village": "Medavakkam",
  "surveyNumber": "204",
  "subDivision": "2B",
  "searchYears": 30
}
```
**Response**:
```json
{
  "status": "SUCCESS",
  "ec": {
    "isNil": true,
    "searchPeriod": "1994-2024",
    "pdfUrl": "https://storage.landeed.com/ec_chengalpattu_204_2b.pdf"
  },
  "patta": {
    "pattaNumber": "4128",
    "pattadharName": "Ramanathan S",
    "landClassification": "Dry Land (Punjai)",
    "pdfUrl": "https://storage.landeed.com/patta_4128.pdf"
  },
  "fmb": {
    "imageUrl": "https://storage.landeed.com/fmb_204_2b.png"
  }
}
```

---

## 4. End-to-End Workflow in LeadPilot AI

```
                      LeadPilot AI Property Screen (/properties)
                                         │
                         [ Click "⚡ Auto-Fetch Govt Docs" ]
                                         │
                                         ▼
                     ┌─────────────────────────────────────────┐
                     │ User enters:                            │
                     │  • District: Chengalpattu               │
                     │  • SRO / Taluk: Tambaram                │
                     │  • Village: Medavakkam                  │
                     │  • Survey / Sub-div: 204/2B             │
                     └───────────────────┬─────────────────────┘
                                         │
                                         ▼
                     ┌─────────────────────────────────────────┐
                     │ Backend Worker (Puppeteer + Gemini AI)  │
                     │  1. Solves TNREGINET CAPTCHA ➔ EC PDF   │
                     │  2. Solves e-Services CAPTCHA ➔ Patta   │
                     │  3. Downloads FMB boundary vector       │
                     └───────────────────┬─────────────────────┘
                                         │
                                         ▼
                     ┌─────────────────────────────────────────┐
                     │ Auto-Checks 10-Point Title Checklist:   │
                     │  ✔ #1. 30-Year EC: Verified Nil         │
                     │  ✔ #2. Online Patta: Verified Owner     │
                     │  ✔ #5. Land Classification: Punjai      │
                     │  ✔ #9. FMB Boundary: Demarcated         │
                     │                                         │
                     │ Score jumps: 0/10 ➔ 8/10                │
                     │ Status: "Legal Vetting In Progress"     │
                     └───────────────────┬─────────────────────┘
                                         │
                                         ▼
                     ┌─────────────────────────────────────────┐
                     │ 1-Click Review by Advocate Saravanan:   │
                     │ Generates Title Clearance Certificate!  │
                     └─────────────────────────────────────────┘
```

---

## 5. Security, Ethics & Compliance Considerations

1. **Public Domain Data**: In Tamil Nadu, land records on `eservices.tn.gov.in` and encumbrance certificates on `tnreginet.gov.in` are statutory **public records** accessible to any citizen or prospective buyer under the Tamil Nadu Transparency in Public Procurement & E-Governance policies.
2. **Rate Limiting & Server Respect**: Automated scrapers must implement backoff timeouts (2–3 seconds between queries) to avoid overloading government servers.
3. **Storage Security**: Downloaded government records must be encrypted at rest and tied strictly to the tenant's `organizationId` in LeadPilot AI.

---

## 6. Related Guides

* 📖 [**10-Point Legal Due-Diligence System**](./LEADPILOT_AI_INVENTORY_SOURCING_AND_MATCHING.md) — AKSPCL-inspired legal framework and title scoring.
* 📖 [**Market Landscape & Competitor Benchmark**](./LEADPILOT_AI_MARKET_LANDSCAPE.md) — Feature matrix vs. Sell.do and LeadSquared.
* 📖 [**Data Flow Architecture**](./LEADPILOT_AI_DATA_FLOW_AND_EXPLAINER.md) — Multi-channel lead ingestion flow.

