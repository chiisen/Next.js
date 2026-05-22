import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

// POST /api/withdraw/request - Create withdraw request
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "未登入" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, bankName, bankAccount, accountName, callbackUrl, channelId } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "金額必須大於 0" }, { status: 400 });
    }

    if (!bankName || !bankAccount || !accountName) {
      return NextResponse.json({ error: "銀行資料必填" }, { status: 400 });
    }

    const merchantId = session.user.id;
    if (!merchantId) {
      return NextResponse.json({ error: "無效的用戶" }, { status: 400 });
    }

    // Generate order number
    const orderNo = `W${Date.now()}${uuidv4().slice(0, 8).toUpperCase()}`;

    // TODO: 系統扣減商戶餘額（需等 CashBook 模組完成後實作）

    const withdraw = await prisma.withdraw.create({
      data: {
        orderNo,
        merchantId,
        amount,
        bankName,
        bankAccount,
        accountName,
        channelId: channelId || null,
        callbackUrl: callbackUrl || null,
        status: "PENDING_REVIEW", // 代付需要管理員審核
      },
      include: {
        channel: true,
      },
    });

    return NextResponse.json({ withdraw }, { status: 201 });
  } catch (error) {
    console.error("Create withdraw error:", error);
    return NextResponse.json({ error: "建立代付請求失敗" }, { status: 500 });
  }
}