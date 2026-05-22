import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/blacklist/check/route";
import { NextRequest } from "next/server";

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    blacklist: {
      findFirst: vi.fn(),
    },
  },
}));

describe("Blacklist Check API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/blacklist/check", () => {
    it("should return isBlacklisted: true if value is in blacklist", async () => {
      const { prisma } = await import("@/lib/prisma");
      vi.mocked(prisma.blacklist.findFirst).mockResolvedValue({
        id: "blacklist-1",
        type: "ID_CARD" as const,
        value: "A123456789",
        reason: "Suspicious activity",
        createdAt: new Date(),
        createdBy: "admin",
      } as any);

      const request = new NextRequest("http://localhost:3000/api/blacklist/check", {
        method: "POST",
        body: JSON.stringify({ type: "ID_CARD", value: "A123456789" }),
      });
      const response = await POST(request);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.isBlacklisted).toBe(true);
    });

    it("should return isBlacklisted: false if value is not in blacklist", async () => {
      const { prisma } = await import("@/lib/prisma");
      vi.mocked(prisma.blacklist.findFirst).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/blacklist/check", {
        method: "POST",
        body: JSON.stringify({ type: "ID_CARD", value: "X123456789" }),
      });
      const response = await POST(request);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.isBlacklisted).toBe(false);
    });

    it("should return 400 if type or value is missing", async () => {
      const request = new NextRequest("http://localhost:3000/api/blacklist/check", {
        method: "POST",
        body: JSON.stringify({ type: "ID_CARD" }),
      });
      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });
});