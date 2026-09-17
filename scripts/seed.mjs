import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting LeadPilot AI Seed Process...");

  // 1. Seed Plan Configurations
  console.log("Creating Plan Configurations...");
  const plans = [
    {
      plan: "STARTER",
      name: "Starter Pilot",
      priceMonthly: 999,
      priceAnnual: 9990,
      leadLimit: 500,
      features: JSON.stringify([
        "Up to 500 Leads / month",
        "AI Lead Scoring & Qualification",
        "WhatsApp & SMS Templates",
        "1 Organization & 3 Users",
        "Basic Analytics & CRM",
      ]),
    },
    {
      plan: "GROWTH",
      name: "Growth Agency",
      priceMonthly: 2499,
      priceAnnual: 24990,
      leadLimit: 5000,
      features: JSON.stringify([
        "Up to 5,000 Leads / month",
        "Advanced AI Reply Generator",
        "WhatsApp Business Cloud API",
        "Property Matching Engine",
        "Unlimited Users & Roles",
        "CSV Bulk Import & Export",
      ]),
    },
    {
      plan: "BUSINESS",
      name: "Enterprise Business",
      priceMonthly: 4999,
      priceAnnual: 49990,
      leadLimit: 100000,
      features: JSON.stringify([
        "Unlimited Leads & Multi-channel Tracking",
        "Custom AI Model Tuning & Tone Control",
        "Website Embed Lead Capture Widget",
        "Dedicated Account Manager",
        "Automated Follow-up Sequences",
        "Custom Webhook & API Access",
      ]),
    },
  ];

  for (const p of plans) {
    await prisma.planConfig.upsert({
      where: { plan: p.plan },
      create: p,
      update: p,
    });
  }

  // 2. Demo Organization: "Chennai Prime Realty"
  console.log("Creating Organization: Chennai Prime Realty...");
  const orgSlug = "chennai-prime-realty";
  let org = await prisma.organization.findUnique({ where: { slug: orgSlug } });

  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: "Chennai Prime Realty",
        slug: orgSlug,
        businessType: "REAL_ESTATE",
        city: "Chennai",
        country: "India",
        phone: "+91 44 2828 9000",
        email: "contact@chennaiprimerealty.com",
        currency: "INR",
        settings: {
          create: {
            preferredAiProvider: "GEMINI",
            aiResponseTone: "Professional, warm and consultative Chennai real estate advisor",
            businessDescription: "Chennai Prime Realty is a premier property advisory firm specializing in residential apartments, luxury villas, and commercial spaces across OMR, ECR, Anna Nagar, and Velachery.",
            defaultLanguage: "English (Indian)",
            followUpRules: JSON.stringify({
              hotLeadCallWithinMins: 15,
              autoFollowUpDays: 2,
              siteVisitReminderHours: 4,
            }),
          },
        },
        subscription: {
          create: {
            plan: "GROWTH",
            status: "ACTIVE",
            billingCycle: "MONTHLY",
            leadLimit: 5000,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
    });
  }

  // 3. Create 5 Users
  console.log("Creating 5 Users for Chennai Prime Realty...");
  const defaultPasswordHash = await bcrypt.hash("Leadpilot@123", 10);

  const userData = [
    {
      name: "Suresh Ramanathan",
      email: "suresh@chennaiprimerealty.com",
      role: "OWNER",
      phone: "+91 98400 11001",
    },
    {
      name: "Deepa Krishnan",
      email: "deepa@chennaiprimerealty.com",
      role: "ADMIN",
      phone: "+91 98400 11002",
    },
    {
      name: "Venkatesh Iyer",
      email: "venkatesh@chennaiprimerealty.com",
      role: "MANAGER",
      phone: "+91 98400 11003",
    },
    {
      name: "Karthik Subramanian",
      email: "karthik@chennaiprimerealty.com",
      role: "SALES_USER",
      phone: "+91 98400 11004",
    },
    {
      name: "Ananya Sundaram",
      email: "ananya@chennaiprimerealty.com",
      role: "SALES_USER",
      phone: "+91 98400 11005",
    },
  ];

  const createdUsers = [];
  for (const u of userData) {
    const existing = await prisma.user.findFirst({
      where: { organizationId: org.id, email: u.email },
    });
    if (!existing) {
      const created = await prisma.user.create({
        data: {
          organizationId: org.id,
          name: u.name,
          email: u.email,
          passwordHash: defaultPasswordHash,
          role: u.role,
          phone: u.phone,
        },
      });
      createdUsers.push(created);
    } else {
      createdUsers.push(existing);
    }
  }

  const salesUsers = createdUsers.filter((u) => u.role === "SALES_USER" || u.role === "MANAGER");

  // 4. Create 20 Properties
  console.log("Creating 20 Verified Properties...");
  const propertiesData = [
    {
      title: "Radiance Smartville 2BHK",
      description: "Modern gated community apartment near IT corridor with club house, gym, and 24/7 security.",
      location: "OMR, Thoraipakkam",
      city: "Chennai",
      price: 6800000,
      propertyType: "Apartment",
      bedrooms: 2,
      bathrooms: 2,
      area: 1120,
      status: "AVAILABLE",
      amenities: ["Swimming Pool", "Gym", "Power Backup", "Covered Car Parking"],
    },
    {
      title: "Casagrand Zenith 3BHK Luxury",
      description: "Spacious luxury flat overlooking green lung space with Italian marble flooring and modular kitchen.",
      location: "Medavakkam",
      city: "Chennai",
      price: 9200000,
      propertyType: "Apartment",
      bedrooms: 3,
      bathrooms: 3,
      area: 1540,
      status: "AVAILABLE",
      amenities: ["Clubhouse", "Children Play Area", "24/7 Security", "Jogging Track"],
    },
    {
      title: "Appaswamy Platina 3BHK",
      description: "High-rise executive apartment with breathtaking city view, right beside key tech parks.",
      location: "Porur",
      city: "Chennai",
      price: 11500000,
      propertyType: "Apartment",
      bedrooms: 3,
      bathrooms: 3,
      area: 1680,
      status: "AVAILABLE",
      amenities: ["Infinity Pool", "Badminton Court", "EV Charging", "Piped Gas"],
    },
    {
      title: "VGN Fairmont 2BHK Value Home",
      description: "Affordable family home with high rental yield potential, 5 mins from upcoming metro station.",
      location: "Guindy",
      city: "Chennai",
      price: 7800000,
      propertyType: "Apartment",
      bedrooms: 2,
      bathrooms: 2,
      area: 1050,
      status: "AVAILABLE",
      amenities: ["Gym", "Rainwater Harvesting", "Lift", "Security"],
    },
    {
      title: "Akshaya Today 1BHK Studio",
      description: "Compact, smartly designed studio apartment ideal for IT bachelors and young couples.",
      location: "OMR, Kelambakkam",
      city: "Chennai",
      price: 3800000,
      propertyType: "Apartment",
      bedrooms: 1,
      bathrooms: 1,
      area: 610,
      status: "AVAILABLE",
      amenities: ["Lift", "Security", "Power Backup"],
    },
    {
      title: "Olympia Opaline Sea View 3BHK",
      description: "Breathtaking panoramic sea views from the 14th floor, world-class amenities and private clubhouse.",
      location: "Navalur, OMR",
      city: "Chennai",
      price: 14500000,
      propertyType: "Apartment",
      bedrooms: 3,
      bathrooms: 3,
      area: 1890,
      status: "AVAILABLE",
      amenities: ["Sea View", "Clubhouse", "Squash Court", "Restaurant"],
    },
    {
      title: "Prestige Courtyards 2.5BHK",
      description: "Neoclassical architecture with spacious balconies and dedicated home office space.",
      location: "Sholinganallur",
      city: "Chennai",
      price: 8800000,
      propertyType: "Apartment",
      bedrooms: 2,
      bathrooms: 2,
      area: 1280,
      status: "AVAILABLE",
      amenities: ["Tennis Court", "Swimming Pool", "Billiards", "Park"],
    },
    {
      title: "Hiranandani Parks 4BHK Villa",
      description: "Independent golf-themed villa with private landscaped garden and double-car port.",
      location: "Oragadam",
      city: "Chennai",
      price: 21000000,
      propertyType: "Villa",
      bedrooms: 4,
      bathrooms: 4,
      area: 2850,
      status: "AVAILABLE",
      amenities: ["Golf Course", "Private Garden", "Sports Complex", "Hospital"],
    },
    {
      title: "Ceebros Boulevard 3BHK",
      description: "Quiet residential sanctuary in premier central neighborhood with high ceiling heights.",
      location: "Adyar",
      city: "Chennai",
      price: 26500000,
      propertyType: "Apartment",
      bedrooms: 3,
      bathrooms: 3,
      area: 1950,
      status: "AVAILABLE",
      amenities: ["24/7 Security", "Private Elevator", "Terrace Garden"],
    },
    {
      title: "True Value 2BHK Budget",
      description: "Budget-friendly apartment near Tambaram Railway Station with clear CMDA approvals.",
      location: "Tambaram West",
      city: "Chennai",
      price: 5200000,
      propertyType: "Apartment",
      bedrooms: 2,
      bathrooms: 2,
      area: 940,
      status: "AVAILABLE",
      amenities: ["Covered Parking", "CCTV", "Borewell & Corporation Water"],
    },
    {
      title: "Tambaram Grandeur 2BHK",
      description: "Ready-to-move 2BHK near MEPZ and Hindu Mission Hospital with zero GST.",
      location: "Tambaram East",
      city: "Chennai",
      price: 6400000,
      propertyType: "Apartment",
      bedrooms: 2,
      bathrooms: 2,
      area: 1080,
      status: "AVAILABLE",
      amenities: ["Lift", "Power Backup", "Solar Water Heating"],
    },
    {
      title: "ECR Beachfront Luxury Villa",
      description: "Palatial 4BHK villa 200 meters from golden sandy beach, private plunge pool and party deck.",
      location: "ECR, Palavakkam",
      city: "Chennai",
      price: 38000000,
      propertyType: "Villa",
      bedrooms: 4,
      bathrooms: 5,
      area: 3600,
      status: "AVAILABLE",
      amenities: ["Private Pool", "Beach Access", "Servant Quarters", "Home Automation"],
    },
    {
      title: "Anna Nagar Tower View 3BHK",
      description: "Prestigious address in prime Anna Nagar Western Extension, walking distance from metro.",
      location: "Anna Nagar",
      city: "Chennai",
      price: 24000000,
      propertyType: "Apartment",
      bedrooms: 3,
      bathrooms: 3,
      area: 1780,
      status: "AVAILABLE",
      amenities: ["Gym", "Intercom", "2 Car Parks", "Rooftop Party Area"],
    },
    {
      title: "Velachery Prime Commercial Plot",
      description: "Corner commercial plot with 60ft frontage on main arterial road, ideal for showroom or clinic.",
      location: "Velachery",
      city: "Chennai",
      price: 45000000,
      propertyType: "Commercial",
      bedrooms: null,
      bathrooms: null,
      area: 4800,
      status: "AVAILABLE",
      amenities: ["Main Road Frontage", "Commercial Zone Approval"],
    },
    {
      title: "Purva Windermere 2BHK",
      description: "Lakeside serenity meets urban convenience with multi-tiered clubhouse and 3 swimming pools.",
      location: "Pallikaranai",
      city: "Chennai",
      price: 7400000,
      propertyType: "Apartment",
      bedrooms: 2,
      bathrooms: 2,
      area: 1220,
      status: "RESERVED",
      amenities: ["Lake View", "Clubhouse", "Gym", "Supermarket"],
    },
    {
      title: "Sobha Meritta 3BHK",
      description: "German engineering standards with world-class Sobha finishes, near SIPCOT IT Park.",
      location: "Siruseri, OMR",
      city: "Chennai",
      price: 9800000,
      propertyType: "Apartment",
      bedrooms: 3,
      bathrooms: 3,
      area: 1620,
      status: "AVAILABLE",
      amenities: ["Tennis Court", "Cricket Pitch", "Swimming Pool", "Spa"],
    },
    {
      title: "Urbanrise Revolution 2BHK",
      description: "Young modern urban habitat featuring smart co-working pods and rooftop telescope deck.",
      location: "Padur, OMR",
      city: "Chennai",
      price: 5900000,
      propertyType: "Apartment",
      bedrooms: 2,
      bathrooms: 2,
      area: 980,
      status: "AVAILABLE",
      amenities: ["Co-working Space", "Gaming Zone", "Mini Theatre"],
    },
    {
      title: "Adyar Park View Heritage 4BHK",
      description: "Exclusive single apartment per floor residential project overlooking historic park.",
      location: "Adyar, Gandhi Nagar",
      city: "Chennai",
      price: 49000000,
      propertyType: "Apartment",
      bedrooms: 4,
      bathrooms: 4,
      area: 3200,
      status: "SOLD",
      amenities: ["Private Elevator", "3 Car Parks", "Infinity Pool", "Concierge"],
    },
    {
      title: "Brigade Xanadu 2BHK",
      description: "Spanish-style township with extensive landscaped foliage and central courtyard.",
      location: "Mogappair West",
      city: "Chennai",
      price: 8200000,
      propertyType: "Apartment",
      bedrooms: 2,
      bathrooms: 2,
      area: 1190,
      status: "AVAILABLE",
      amenities: ["Clubhouse", "Indoor Games", "Jogging Track"],
    },
    {
      title: "Kences Brindavan 3BHK",
      description: "Posh residential avenue close to top schools like DAV and PSBB.",
      location: "KK Nagar",
      city: "Chennai",
      price: 18500000,
      propertyType: "Apartment",
      bedrooms: 3,
      bathrooms: 3,
      area: 1720,
      status: "AVAILABLE",
      amenities: ["Covered Car Park", "Lift", "Security", "Power Backup"],
    },
  ];

  for (const p of propertiesData) {
    const existing = await prisma.property.findFirst({
      where: { organizationId: org.id, title: p.title },
    });
    if (!existing) {
      await prisma.property.create({
        data: {
          organizationId: org.id,
          title: p.title,
          description: p.description,
          location: p.location,
          city: p.city,
          price: p.price,
          propertyType: p.propertyType,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          area: p.area,
          status: p.status,
          amenities: JSON.stringify(p.amenities),
          images: JSON.stringify(["/property-placeholder.jpg"]),
        },
      });
    }
  }

  // 5. Create 50 Realistic Leads
  console.log("Creating 50 Realistic Leads with AI Analyses, Follow-ups, and Activities...");
  const leadTemplates = [
    { name: "Rajesh Kannan", phone: "+91 98401 23456", email: "rajesh.k@gmail.com", loc: "Tambaram", req: "I need a 2BHK near Tambaram under 70 lakhs, ready to move.", bMax: 7000000, bhk: 2, src: "WHATSAPP", status: "HOT", urgency: "HIGH", score: 88 },
    { name: "Priya Sundaram", phone: "+91 98402 34567", email: "priya.s@outlook.com", loc: "OMR, Thoraipakkam", req: "Looking for 2 or 3BHK flat on OMR near TCS office, budget 85L.", bMax: 8500000, bhk: 3, src: "WEBSITE", status: "QUALIFIED", urgency: "MEDIUM", score: 76 },
    { name: "Kumaravel Murugan", phone: "+91 98403 45678", email: "kumaravel.m@yahoo.com", loc: "Velachery", req: "Need a residential apartment in Velachery near railway station under 1.1 Crore.", bMax: 11000000, bhk: 3, src: "FACEBOOK", status: "SITE_VISIT", urgency: "HIGH", score: 84 },
    { name: "Ananya Narayanan", phone: "+91 98404 56789", email: "ananya.n@gmail.com", loc: "ECR, Palavakkam", req: "Looking for an independent villa on ECR close to beach. Budget 3.5 to 4 Cr.", bMax: 40000000, bhk: 4, src: "PHONE", status: "NEGOTIATION", urgency: "HIGH", score: 92 },
    { name: "Arun Swaminathan", phone: "+91 98405 67890", email: "arun.swami@gmail.com", loc: "Anna Nagar", req: "Looking for 3BHK in Anna Nagar, budget 2.2 Cr. Need good school proximity.", bMax: 22000000, bhk: 3, src: "GOOGLE_FORM", status: "QUALIFIED", urgency: "MEDIUM", score: 78 },
    { name: "Divya Balaji", phone: "+91 98406 78901", email: "divya.balaji@hotmail.com", loc: "Medavakkam", req: "Want 2BHK gated community flat under 60 lakhs with loan assistance.", bMax: 6000000, bhk: 2, src: "WHATSAPP", status: "CONTACTED", urgency: "MEDIUM", score: 68 },
    { name: "Siddharth Chandran", phone: "+91 98407 89012", email: "sid.chandran@gmail.com", loc: "Porur", req: "3BHK near DLF IT park, budget 1.15 Cr, possession within 6 months.", bMax: 11500000, bhk: 3, src: "WEBSITE", status: "CONVERTED", urgency: "HIGH", score: 96 },
    { name: "Lakshmi Narayanan", phone: "+91 98408 90123", email: "lakshmi.n@gmail.com", loc: "Adyar", req: "Looking for high-end luxury apartment in Adyar or Besant Nagar. Budget 2.5 Cr.", bMax: 25000000, bhk: 3, src: "MANUAL", status: "FOLLOW_UP", urgency: "MEDIUM", score: 74 },
    { name: "Gautham Ramakrishnan", phone: "+91 98409 01234", email: "gautham.r@gmail.com", loc: "Navalur", req: "Need 2BHK or 3BHK near Vivira Mall, budget around 75L.", bMax: 7500000, bhk: 2, src: "INSTAGRAM", status: "NEW", urgency: "LOW", score: 55 },
    { name: "Meera Krishnaswamy", phone: "+91 98410 12345", email: "meera.k@gmail.com", loc: "Guindy", req: "Looking for 2BHK flat near Kathipara junction with power backup. Budget 80L.", bMax: 8000000, bhk: 2, src: "WEBSITE", status: "QUALIFIED", urgency: "HIGH", score: 82 },
    { name: "Vignesh Thirumalai", phone: "+91 98411 23456", email: "vignesh.t@gmail.com", loc: "Sholinganallur", req: "Want 2BHK under 65 Lakhs near Elcot SEZ, ready to inspect this weekend.", bMax: 6500000, bhk: 2, src: "WHATSAPP", status: "SITE_VISIT", urgency: "HIGH", score: 89 },
    { name: "Kavitha Natarajan", phone: "+91 98412 34567", email: "kavitha.n@gmail.com", loc: "Chromepet", req: "2BHK near MIT flyover under 55 Lakhs.", bMax: 5500000, bhk: 2, src: "PHONE", status: "CONTACTED", urgency: "LOW", score: 62 },
    { name: "Ramesh Venkatesan", phone: "+91 98413 45678", email: "ramesh.v@gmail.com", loc: "Pallikaranai", req: "Looking for 3BHK near marshland with clubhouse, budget 90L.", bMax: 9000000, bhk: 3, src: "CSV", status: "FOLLOW_UP", urgency: "MEDIUM", score: 71 },
    { name: "Bhavani Sridhar", phone: "+91 98414 56789", email: "bhavani.s@gmail.com", loc: "Siruseri", req: "3BHK near Sipcot entrance, budget around 1 Cr.", bMax: 10000000, bhk: 3, src: "WHATSAPP", status: "CONVERTED", urgency: "HIGH", score: 94 },
    { name: "Kishore Padmanabhan", phone: "+91 98415 67890", email: "kishore.p@gmail.com", loc: "Oragadam", req: "Looking for row house or villa near auto hub, budget 1.8 Cr.", bMax: 18000000, bhk: 4, src: "FACEBOOK", status: "LOST", urgency: "LOW", score: 35 },
  ];

  // Expand to 50 realistic entries using Indian names and localities
  const chennaiLocs = ["Tambaram", "OMR", "Velachery", "Anna Nagar", "Porur", "Medavakkam", "Adyar", "ECR", "Guindy", "Navalur", "Sholinganallur", "Perungudi", "Chromepet", "Pallikaranai", "Mogappair"];
  const indianFirstNames = ["Aravind", "Vijay", "Deepak", "Swetha", "Naveen", "Harish", "Sangeetha", "Manoj", "Keerthana", "Surya", "Sandhya", "Ashwin", "Shruti", "Senthil", "Preeti", "Ganesh", "Madhuri", "Saravanan", "Nalini", "Vasanth", "Rohit", "Sneha", "Karthika", "Balaji", "Rekha", "Dhanush", "Lavanya", "Ajith", "Revathi", "Kalyan", "Nithya", "Prasad", "Gayathri", "Jagan", "Shalini"];
  const indianLastNames = ["Sundar", "Rao", "Reddy", "Menon", "Pillai", "Chettiar", "Naidu", "Varma", "Guptha", "Acharya", "Pandian", "Nambiar", "Babu", "Moorthy", "Chandran", "Shetty", "Nair", "Iyer"];
  const sources = ["WEBSITE", "WHATSAPP", "GOOGLE_FORM", "FACEBOOK", "INSTAGRAM", "PHONE", "MANUAL", "CSV"];
  const statuses = ["NEW", "CONTACTED", "QUALIFIED", "FOLLOW_UP", "SITE_VISIT", "NEGOTIATION", "CONVERTED", "LOST"];

  const allLeadRows = [...leadTemplates];

  for (let i = leadTemplates.length; i < 50; i++) {
    const fName = indianFirstNames[i % indianFirstNames.length];
    const lName = indianLastNames[i % indianLastNames.length];
    const name = `${fName} ${lName}`;
    const loc = chennaiLocs[i % chennaiLocs.length];
    const bhk = (i % 3) + 1; // 1, 2, or 3 BHK
    const budgetLakhs = 45 + (i * 4) % 180;
    const bMax = budgetLakhs * 100000;
    const status = statuses[i % statuses.length];
    const src = sources[i % sources.length];
    const phone = `+91 984${(10 + i).toString().padStart(2, "0")} ${(20000 + i * 345).toString().slice(0, 5)}`;
    const email = `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@example.com`;
    const score = Math.min(95, Math.max(30, 45 + (i * 7) % 52));
    const urgency = score > 75 ? "HIGH" : score > 55 ? "MEDIUM" : "LOW";

    allLeadRows.push({
      name,
      phone,
      email,
      loc,
      req: `Enquiring for a ${bhk}BHK residential unit in ${loc} within ₹${budgetLakhs} Lakhs. Need details regarding approvals and bank loan.`,
      bMax,
      bhk,
      src,
      status,
      urgency,
      score,
    });
  }

  // Insert leads into database
  for (let idx = 0; idx < allLeadRows.length; idx++) {
    const t = allLeadRows[idx];
    const assignedUser = salesUsers[idx % salesUsers.length];

    const existingLead = await prisma.lead.findFirst({
      where: { organizationId: org.id, phone: t.phone },
    });

    if (!existingLead) {
      const scheduledFollowUp = new Date();
      scheduledFollowUp.setDate(scheduledFollowUp.getDate() + ((idx % 5) - 2)); // Some overdue, some today, some future

      const lead = await prisma.lead.create({
        data: {
          organizationId: org.id,
          name: t.name,
          phone: t.phone,
          email: t.email,
          source: t.src,
          status: t.status,
          priority: t.score >= 80 ? "URGENT" : t.score >= 60 ? "HIGH" : "MEDIUM",
          leadScore: t.score,
          requirement: t.req,
          location: t.loc,
          budgetMin: t.bMax * 0.8,
          budgetMax: t.bMax,
          propertyType: "Apartment",
          bedrooms: t.bhk,
          purchaseIntent: "BUY",
          urgency: t.urgency,
          assignedUserId: assignedUser.id,
          lastContactedAt: new Date(Date.now() - (idx % 4) * 24 * 60 * 60 * 1000),
          nextFollowUpAt: scheduledFollowUp,
        },
      });

      // Create AiAnalysis
      await prisma.aiAnalysis.create({
        data: {
          organizationId: org.id,
          leadId: lead.id,
          summary: `Qualified buyer looking for ${t.bhk}BHK in ${t.loc} under ₹${(t.bMax / 100000).toFixed(0)}L.`,
          intent: "BUY",
          location: t.loc,
          propertyType: "Apartment",
          bedrooms: t.bhk,
          budgetMin: t.bMax * 0.8,
          budgetMax: t.bMax,
          urgency: t.urgency,
          leadScore: t.score,
          missingInformation: JSON.stringify(["Possession timeline", "Home loan pre-approval"]),
          recommendedNextAction: t.score >= 80 ? "Schedule immediate site visit" : "Share verified WhatsApp listing brochures",
          modelUsed: "gemini-1.5-flash",
        },
      });

      // Create FollowUp record
      await prisma.followUp.create({
        data: {
          organizationId: org.id,
          leadId: lead.id,
          assignedUserId: assignedUser.id,
          scheduledAt: scheduledFollowUp,
          type: idx % 2 === 0 ? "WHATSAPP" : "CALL",
          status: idx % 4 === 0 ? "COMPLETED" : "PENDING",
          message: `Follow up with ${t.name} regarding shortlisted properties in ${t.loc}.`,
        },
      });

      // Create Activity record
      await prisma.activity.create({
        data: {
          organizationId: org.id,
          leadId: lead.id,
          userId: assignedUser.id,
          type: "NOTE",
          description: `Customer enquiry received via ${t.src}: "${t.req}"`,
        },
      });
    }
  }

  console.log("✅ Seed completed successfully! Organization: Chennai Prime Realty with 5 users, 20 properties, and 50 leads.");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

