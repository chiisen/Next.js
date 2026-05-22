import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/bank-accounts - Query available bank accounts
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "未登入" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {
      isAllocated: false,
      status: "ACTIVE",
    };
    if (groupId) where.groupId = groupId;
    if (status) where.status = status;

    const bankAccounts = await prisma.bankAccount.findMany({
      where,
      include: {
        bank: true,
        group: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ bankAccounts });
  } catch (error) {
    console.error("Query bank accounts error:", error);
    return NextResponse.json({ error: "查詢失敗" }, { status: 500 });
  }
}