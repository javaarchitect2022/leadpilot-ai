import { describe, it, expect } from "vitest";
import { parseCsvContent } from "../services/csv-import";

describe("CSV Lead Import & Parsing", () => {
  it("should parse CSV string into headers and rows", () => {
    const csvData = `name,phone,email,budget,location
Rajesh Kumar,9840012345,rajesh@example.com,7000000,Tambaram
Priya Sundar,9840054321,priya@example.com,8500000,OMR`;

    const result = parseCsvContent(csvData);
    expect(result.headers).toEqual(["name", "phone", "email", "budget", "location"]);
    expect(result.data.length).toBe(2);
    expect(result.data[0].name).toBe("Rajesh Kumar");
    expect(result.data[0].phone).toBe("9840012345");
  });

  it("should handle empty or malformed rows cleanly without crashing", () => {
    const malformedCsv = `name,phone,email
,,,,
Kumaravel,9840099999,kumar@example.com
`;
    const result = parseCsvContent(malformedCsv);
    expect(result.data.length).toBeGreaterThanOrEqual(1);
  });
});

