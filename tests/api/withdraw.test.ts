import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/withdraw/request/route";
import { NextRequest } from "next/server";

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    withdraw: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
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

describe("Withdraw Request API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/withdraw/request", () => {
    it("should create withdraw request with valid data", async () => {
      const mockWithdraw = {
        id: "new-withdraw-id",
        orderNo: "W123456789",
        amount: 1000,
        status: "PENDING_REVIEW",
        merchantId: "test-merchant-id",
        bankName: "Test Bank",
        bankAccount: "123456789",
        accountName: "Test User",
      };

      const { prisma } = await import("@/lib/prisma");
      vi.mocked(prisma.withdraw.create).mockResolvedValue(mockWithdraw as any);

      const request = new NextRequest("http://localhost:3000/api/withdraw/request", {
        method: "POST",
        body: JSON.stringify({
          amount: 1000,
          bankName: "Test Bank",
          bankAccount: "123456789",
          accountName: "Test User",
        }),
      });
      const response = await POST(request);
      expect(response.status).toBe(201);
    });

    it("should return 400 if amount is invalid", async () => {
      const request = new NextRequest("http://localhost:3000/api/withdraw/request", {
        method: "POST",
        body: JSON.stringify({
          amount: -100,
          bankName: "Test Bank",
          bankAccount: "123456789",
          accountName: "Test User",
        }),
      });
      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("should return 400 if bank info is incomplete", async () => {
      const request = new NextRequest("http://localhost:3000/api/withdraw/request", {
        method: "POST",
        body: JSON.stringify({
          amount: 1000,
          bankName: "Test Bank",
          // missing bankAccount and accountName
        }),
      });
      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });
});