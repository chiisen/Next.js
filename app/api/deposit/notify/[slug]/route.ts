import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/client";

// POST /api/deposit/notify/[slug] - Handle deposit callback from channel
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

    // 解析 callback 資料（不同通道格式不同，這裡做統一抽象）
    // 實際實作需要根據各通道調整
    const { utr, amount, payerName, orderNo, status } = body;

    // 尋找對應的代收訂單
    const deposit = await prisma.deposit.findFirst({
      where: {
        orderNo,
        channelId: channel.id,
      },
    });

    if (!deposit) {
      return NextResponse.json({ error: "找不到該筆訂單" }, { status: 404 });
    }

    // 判斷狀態並更新
    let newStatus: "MATCHING" | "COMPLETED" | "FAILED" = "MATCHING";
    if (status === "success" || status === "completed") {
      newStatus = "COMPLETED";
    } else if (status === "failed") {
      newStatus = "FAILED";
    }

    const updated = await prisma.deposit.update({
      where: { id: deposit.id },
      data: {
        status: newStatus,
        utr: utr || null,
        payerName: payerName || null,
        callbackStatus: JSON.stringify(body),
        completedAt: newStatus === "COMPLETED" ? new Date() : null,
      },
    });

    // 如果已完成，觸發撮合系統並計算佣金
    if (newStatus === "COMPLETED") {
      // TODO: 呼叫佣金計算邏輯
      // TODO: 通知商戶 callbackUrl
    }

    return NextResponse.json({ success: true, deposit: updated });
  } catch (error) {
    console.error("Deposit notify error:", error);
    return NextResponse.json({ error: "處理失敗" }, { status: 500 });
  }
}