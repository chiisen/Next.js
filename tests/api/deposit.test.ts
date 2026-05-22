import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/deposit/route";
import { NextRequest } from "next/server";

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    deposit: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock auth
vi.mock("@/app/api/auth/[...nextauth]/route", () => ({
  auth: vi.fn().mockResolvedValue({
    user: {
      id: "test-merchant-id",
      email: "merchant@test.com",
      name: "Test Merchant",
      role: "MERCHANT",
    },
  }),
}));

describe("Deposit API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/deposit", () => {
    it("should return 401 if not authenticated", async () => {
      vi.mocked(
        await import("@/app/api/auth/[...nextauth]/route")
      ).auth.mockResolvedValueOnce(null);

      const request = new NextRequest("http://localhost:3000/api/deposit");
      const response = await GET(request);
      expect(response.status).toBe(401);
    });

    it("should return deposit list", async () => {
      const mockDeposits = [
        {
          id: "deposit-1",
          orderNo: "D123456",
          amount: 1000,
          status: "PENDING",
          merchantId: "test-merchant-id",
        },
      ];

      const { prisma } = await import("@/lib/prisma");
      vi.mocked(prisma.deposit.findMany).mockResolvedValue(mockDeposits as any);

      const request = new NextRequest("http://localhost:3000/api/deposit");
      const response = await GET(request);
      expect(response.status).toBe(200);
    });
  });

  describe("POST /api/deposit", () => {
    it("should create deposit order", async () => {
      const mockDeposit = {
        id: "new-deposit-id",
        orderNo: "D123456789",
        amount: 1000,
        status: "PENDING",
        merchantId: "test-merchant-id",
      };

      const { prisma } = await import("@/lib/prisma");
      vi.mocked(prisma.deposit.create).mockResolvedValue(mockDeposit as any);

      const request = new NextRequest("http://localhost:3000/api/deposit", {
        method: "POST",
        body: JSON.stringify({ amount: 1000 }),
      });
      const response = await POST(request);
      expect(response.status).toBe(201);
    });

    it("should return 400 if amount is invalid", async () => {
      const request = new NextRequest("http://localhost:3000/api/deposit", {
        method: "POST",
        body: JSON.stringify({ amount: -100 }),
      });
      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });
});