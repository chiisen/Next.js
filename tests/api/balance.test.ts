import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/balance/query/route";
import { NextRequest } from "next/server";
import { Decimal } from "@prisma/client/runtime/client";

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock auth
vi.mock("@/app/api/auth/[...nextauth]/route", () => ({
  auth: vi.fn().mockResolvedValue({
    user: {
      id: "test-user-id",
      email: "test@test.com",
      name: "Test User",
      role: "MERCHANT",
    },
  }),
}));

describe("Balance Query API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/balance/query", () => {
    it("should return user balance", async () => {
      const { prisma } = await import("@/lib/prisma");
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "test-user-id",
        email: "test@test.com",
        name: "Test User",
        balance: new Decimal(10000),
        frozenBalance: new Decimal(1000),
      } as any);

      const request = new NextRequest("http://localhost:3000/api/balance/query");
      const response = await GET(request);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.user.balance).toBe("10000");
      expect(data.user.frozenBalance).toBe("1000");
      expect(data.user.availableBalance).toBe("9000");
    });

    it("should return 404 if user not found", async () => {
      const { prisma } = await import("@/lib/prisma");
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/balance/query");
      const response = await GET(request);
      expect(response.status).toBe(404);
    });
  });
});