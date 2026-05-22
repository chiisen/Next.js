import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

// GET /api/withdraw/withdraw - Query withdraw orders
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "未登入" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get("merchantId");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (merchantId) where.merchantId = merchantId;
    if (status) where.status = status;

    const withdraws = await prisma.withdraw.findMany({
      where,
      include: {
        channel: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ withdraws });
  } catch (error) {
    console.error("Query withdraw error:", error);
    return NextResponse.json({ error: "查詢失敗" }, { status: 500 });
  }
}