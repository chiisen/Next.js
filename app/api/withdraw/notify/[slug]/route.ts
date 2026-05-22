import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/withdraw/notify/[slug] - Handle withdraw callback from channel
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    // TODO: 驗證 channel slug 並驗證簽名
    const channel = await prisma.channel.findUnique({
      where: { code: slug },
    });

    if (!channel) {
      return NextResponse.json({ error: "未知的通道" }, { status: 404 });
    }

    // 解析 callback 資料
    const { orderNo, status, transactionId, errorMsg } = body;

    // 尋找對應的代付訂單
    const withdraw = await prisma.withdraw.findFirst({
      where: {
        orderNo,
        channelId: channel.id,
      },
    });

    if (!withdraw) {
      return NextResponse.json({ error: "找不到該筆訂單" }, { status: 404 });
    }

    // 判斷狀態並更新
    let newStatus: "PROCESSING" | "COMPLETED" | "FAILED" = "PROCESSING";
    if (status === "success" || status === "completed") {
      newStatus = "COMPLETED";
    } else if (status === "failed" || status === "error") {
      newStatus = "FAILED";
    }

    const updated = await prisma.withdraw.update({
      where: { id: withdraw.id },
      data: {
        status: newStatus,
        completedAt: newStatus === "COMPLETED" ? new Date() : null,
      },
    });

    // 如果失敗，需要退款的話應該恢復商戶餘額
    if (newStatus === "FAILED") {
      // TODO: 退款邏輯 - 恢復餘額並記錄 CashBook
    }

    // TODO: 通知商戶 callbackUrl

    return NextResponse.json({ success: true, withdraw: updated });
  } catch (error) {
    console.error("Withdraw notify error:", error);
    return NextResponse.json({ error: "處理失敗" }, { status: 500 });
  }
}