import { prisma } from "@/lib/prisma";

export interface PropertyMatchResult {
  property: {
    id: string;
    title: string;
    description: string | null;
    location: string;
    city: string;
    price: number;
    propertyType: string;
    bedrooms: number | null;
    bathrooms: number | null;
    area: number | null;
    status: string;
    amenities: string[];
    images: string[];
  };
  matchScore: number; // 0 - 100
  matchReasons: string[];
  isBudgetMatch: boolean;
  isLocationMatch: boolean;
  isBhkMatch: boolean;
}

export interface LeadMatchingCriteria {
  organizationId: string;
  location?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  propertyType?: string | null;
  bedrooms?: number | null;
  requirement?: string | null;
}

export async function findMatchingProperties(
  criteria: LeadMatchingCriteria
): Promise<PropertyMatchResult[]> {
  // Step 1: Query deterministic database inventory for this tenant
  const properties = await prisma.property.findMany({
    where: {
      organizationId: criteria.organizationId,
      status: "AVAILABLE",
    },
    take: 50,
  });

  if (properties.length === 0) return [];

  const results: PropertyMatchResult[] = [];

  for (const prop of properties) {
    let score = 50; // Base score for available inventory
    const reasons: string[] = [];
    let isBudgetMatch = false;
    let isLocationMatch = false;
    let isBhkMatch = false;

    // Location matching
    if (criteria.location && criteria.location.trim()) {
      const loc = criteria.location.toLowerCase();
      const propLoc = prop.location.toLowerCase();
      const propCity = prop.city.toLowerCase();

      if (propLoc.includes(loc) || loc.includes(propLoc)) {
        score += 25;
        isLocationMatch = true;
        reasons.push(`Exact location match in ${prop.location}`);
      } else if (propCity.includes(loc) || loc.includes(propCity)) {
        score += 15;
        isLocationMatch = true;
        reasons.push(`Same city location (${prop.city})`);
      } else {
        score -= 10;
      }
    } else {
      reasons.push("Broad location compatibility");
    }

    // Bedroom matching
    if (criteria.bedrooms && prop.bedrooms) {
      if (criteria.bedrooms === prop.bedrooms) {
        score += 20;
        isBhkMatch = true;
        reasons.push(`Direct ${prop.bedrooms}BHK configuration match`);
      } else if (Math.abs(criteria.bedrooms - prop.bedrooms) === 1) {
        score += 5;
        reasons.push(`Close bedroom count (${prop.bedrooms}BHK)`);
      } else {
        score -= 20;
      }
    }

    // Budget matching (tolerance +- 15%)
    if (criteria.budgetMax) {
      const max = criteria.budgetMax;
      const min = criteria.budgetMin || max * 0.7;

      if (prop.price <= max && prop.price >= min) {
        score += 25;
        isBudgetMatch = true;
        reasons.push(`Within expected budget of ₹${(max / 100000).toFixed(1)} Lakhs`);
      } else if (prop.price <= max * 1.15) {
        score += 10;
        isBudgetMatch = true;
        reasons.push(`Slightly above target budget (within 15% negotiation margin)`);
      } else if (prop.price < min) {
        score += 10;
        isBudgetMatch = true;
        reasons.push(`Under customer's minimum budget (value purchase)`);
      } else {
        score -= 30;
      }
    }

    // Property Type matching
    if (criteria.propertyType && prop.propertyType) {
      if (criteria.propertyType.toLowerCase() === prop.propertyType.toLowerCase()) {
        score += 10;
        reasons.push(`${prop.propertyType} category match`);
      }
    }

    const normalizedScore = Math.max(10, Math.min(100, score));

    // Parse JSON images & amenities safely
    let parsedImages: string[] = [];
    let parsedAmenities: string[] = [];
    try {
      if (prop.images) parsedImages = JSON.parse(prop.images);
      if (prop.amenities) parsedAmenities = JSON.parse(prop.amenities);
    } catch {
      // Ignore JSON parse errors
    }

    results.push({
      property: {
        id: prop.id,
        title: prop.title,
        description: prop.description,
        location: prop.location,
        city: prop.city,
        price: prop.price,
        propertyType: prop.propertyType,
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        area: prop.area,
        status: prop.status,
        amenities: parsedAmenities,
        images: parsedImages,
      },
      matchScore: normalizedScore,
      matchReasons: reasons,
      isBudgetMatch,
      isLocationMatch,
      isBhkMatch,
    });
  }

  // Sort by highest match score first
  return results.sort((a, b) => b.matchScore - a.matchScore);
}

