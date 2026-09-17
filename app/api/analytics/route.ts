import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";

export async function GET(req: NextRequest) {
  const { context, errorResponse } = await requireTenant(req, "analytics:view");
  if (errorResponse) return errorResponse;

  const orgId = context.organizationId;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // 1. Fetch KPI Counts
  const [
    totalLeads,
    todayLeads,
    newLeads,
    hotLeads,
    warmLeads,
    followUpsDue,
    siteVisits,
    convertedLeads,
    lostLeads,
    aiAnalysesCount,
    aiRepliesCount,
    allLeadsForPipeline,
  ] = await Promise.all([
    prisma.lead.count({ where: { organizationId: orgId } }),
    prisma.lead.count({ where: { organizationId: orgId, createdAt: { gte: startOfToday } } }),
    prisma.lead.count({ where: { organizationId: orgId, status: "NEW" } }),
    prisma.lead.count({ where: { organizationId: orgId, leadScore: { gte: 75 } } }),
    prisma.lead.count({ where: { organizationId: orgId, leadScore: { gte: 50, lt: 75 } } }),
    prisma.followUp.count({
      where: { organizationId: orgId, status: "PENDING", scheduledAt: { lte: now } },
    }),
    prisma.lead.count({ where: { organizationId: orgId, status: "SITE_VISIT" } }),
    prisma.lead.count({ where: { organizationId: orgId, status: "CONVERTED" } }),
    prisma.lead.count({ where: { organizationId: orgId, status: "LOST" } }),
    prisma.aiAnalysis.count({ where: { organizationId: orgId } }),
    prisma.aiAudit.count({ where: { organizationId: orgId, response: { not: "" } } }),
    prisma.lead.findMany({
      where: { organizationId: orgId },
      select: { status: true, budgetMax: true, budgetMin: true },
    }),
  ]);

  // 2. Compute Pipeline & Converted Revenue
  let estimatedPipelineValue = 0;
  let convertedValue = 0;

  for (const l of allLeadsForPipeline) {
    const val = l.budgetMax || l.budgetMin || 6500000; // default ₹65L if unspecified
    if (l.status === "CONVERTED") {
      convertedValue += val;
    } else if (l.status !== "LOST") {
      estimatedPipelineValue += val;
    }
  }

  // 3. Source Breakdown with Conversion Rates (Requirement #10)
  const leadsBySourceGroup = await prisma.lead.groupBy({
    by: ["source"],
    where: { organizationId: orgId },
    _count: { id: true },
  });

  const convertedBySourceGroup = await prisma.lead.groupBy({
    by: ["source"],
    where: { organizationId: orgId, status: "CONVERTED" },
    _count: { id: true },
  });

  const convertedMap = new Map<string, number>();
  convertedBySourceGroup.forEach((g) => convertedMap.set(g.source, g._count.id));

  const sourcePerformance = leadsBySourceGroup.map((g) => {
    const total = g._count.id;
    const converted = convertedMap.get(g.source) || 0;
    const rate = total > 0 ? ((converted / total) * 100).toFixed(1) : "0.0";
    return {
      source: g.source,
      total,
      converted,
      conversionRate: `${rate}%`,
      conversionRateNum: parseFloat(rate),
    };
  });

  // 4. Status Distribution (Funnel)
  const leadsByStatusGroup = await prisma.lead.groupBy({
    by: ["status"],
    where: { organizationId: orgId },
    _count: { id: true },
  });

  const statusDistribution = leadsByStatusGroup.map((g) => ({
    status: g.status,
    count: g._count.id,
  }));

  // 5. Leads Created Last 14 Days
  const recentLeads = await prisma.lead.findMany({
    where: {
      organizationId: orgId,
      createdAt: { gte: thirtyDaysAgo },
    },
    select: { createdAt: true },
  });

  const daysMap = new Map<string, number>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    daysMap.set(key, 0);
  }

  recentLeads.forEach((l) => {
    const key = l.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (daysMap.has(key)) {
      daysMap.set(key, (daysMap.get(key) || 0) + 1);
    }
  });

  const leadsByDay = Array.from(daysMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));

  return NextResponse.json({
    metrics: {
      totalLeads,
      todayLeads,
      newLeads,
      hotLeads,
      warmLeads,
      followUpsDue,
      siteVisits,
      convertedLeads,
      lostLeads,
      estimatedPipelineValue,
      convertedValue,
      leadsAnalyzed: aiAnalysesCount,
      aiRepliesGenerated: aiRepliesCount,
    },
    sourcePerformance,
    statusDistribution,
    leadsByDay,
  });
}

