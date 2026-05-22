import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/order/query - Query orders (both deposit and withdraw)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "未登入" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderNo = searchParams.get("orderNo");
    const type = searchParams.get("type"); // 'deposit' or 'withdraw'

    if (!orderNo) {
      return NextResponse.json({ error: "請提供訂單編號" }, { status: 400 });
    }

    let order = null;

    if (!type || type === "deposit") {
      order = await prisma.deposit.findUnique({
        where: { orderNo },
        include: {
          merchant: { select: { id: true, name: true, email: true } },
          bankAccount: true,
          channel: true,
        },
      });
      if (order) {
        return NextResponse.json({ order, type: "deposit" });
      }
    }

    if (!type || type === "withdraw") {
      order = await prisma.withdraw.findUnique({
        where: { orderNo },
        include: {
          merchant: { select: { id: true, name: true, email: true } },
          channel: true,
        },
      });
      if (order) {
        return NextResponse.json({ order, type: "withdraw" });
      }
    }

    if (!order) {
      return NextResponse.json({ error: "找不到該筆訂單" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Query order error:", error);
    return NextResponse.json({ error: "查詢失敗" }, { status: 500 });
  }
}