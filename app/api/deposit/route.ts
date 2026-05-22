import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

// GET /api/deposit - Query deposit orders
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

    const deposits = await prisma.deposit.findMany({
      where,
      include: {
        bankAccount: true,
        channel: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ deposits });
  } catch (error) {
    console.error("Query deposit error:", error);
    return NextResponse.json({ error: "查詢失敗" }, { status: 500 });
  }
}

// POST /api/deposit - Create deposit request
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "未登入" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, callbackUrl, channelId } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "金額必須大於 0" }, { status: 400 });
    }

    const merchantId = session.user.id;
    if (!merchantId) {
      return NextResponse.json({ error: "無效的用戶" }, { status: 400 });
    }

    // Generate order number
    const orderNo = `D${Date.now()}${uuidv4().slice(0, 8).toUpperCase()}`;

    // TODO: 系統根據可用帳號分配銀行帳號給商戶
    // 目前暫時設為 null，等 BankAccount 管理模組完成後再實作
    const deposit = await prisma.deposit.create({
      data: {
        orderNo,
        merchantId,
        amount,
        channelId: channelId || null,
        callbackUrl: callbackUrl || null,
        status: "PENDING",
      },
      include: {
        channel: true,
      },
    });

    return NextResponse.json({ deposit }, { status: 201 });
  } catch (error) {
    console.error("Create deposit error:", error);
    return NextResponse.json({ error: "建立代收請求失敗" }, { status: 500 });
  }
}