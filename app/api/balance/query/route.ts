import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/balance/query - Query user balance
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "未登入" }, { status: 401 });
    }

    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: "無效的用戶" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        frozenBalance: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "找不到該用戶" }, { status: 404 });
    }

    const balance = user.balance;
    const frozenBalance = user.frozenBalance;
    const availableBalance = Number(balance) - Number(frozenBalance);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        balance: balance.toString(),
        frozenBalance: frozenBalance.toString(),
        availableBalance: availableBalance.toString(),
      },
    });
  } catch (error) {
    console.error("Query balance error:", error);
    return NextResponse.json({ error: "查詢失敗" }, { status: 500 });
  }
}