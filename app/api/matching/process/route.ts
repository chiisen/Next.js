import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// POST /api/matching/process - Process incoming transfer notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bankAccountId, utr, amount, payerName, transferTime } = body;

    if (!bankAccountId || !amount) {
      return NextResponse.json(
        { error: "缺少必要參數" },
        { status: 400 }
      );
    }

    // 查找該帳號的代收訂單
    const bankAccount = await prisma.bankAccount.findUnique({
      where: { id: bankAccountId },
      include: {
        group: true,
      },
    });

    if (!bankAccount) {
      return NextResponse.json(
        { error: "找不到該銀行帳號" },
        { status: 404 }
      );
    }

    let matchedDeposit = null;
    let matchStrategy = "";

    // 策略 1: UTR 精確匹配
    if (utr) {
      matchedDeposit = await prisma.deposit.findFirst({
        where: {
          bankAccountId,
          utr,
          status: "PENDING",
        },
      });
      if (matchedDeposit) {
        matchStrategy = "UTR";
      }
    }

    // 策略 2: 姓名+金額匹配
    if (!matchedDeposit && payerName && amount) {
      const tolerance = amount * 0.01; // 1% 容差
      matchedDeposit = await prisma.deposit.findFirst({
        where: {
          bankAccountId,
          status: "PENDING",
          amount: {
            gte: amount - tolerance,
            lte: amount + tolerance,
          },
        },
        orderBy: { createdAt: "asc" },
      });
      if (matchedDeposit) {
        matchStrategy = "NAME_AMOUNT";
      }
    }

    // 策略 3: 唯一金額匹配
    if (!matchedDeposit && amount) {
      const pendingDeposits = await prisma.deposit.findMany({
        where: {
          bankAccountId,
          status: "PENDING",
          amount: new Prisma.Decimal(amount),
        },
      });
      if (pendingDeposits.length === 1) {
        matchedDeposit = pendingDeposits[0];
        matchStrategy = "UNIQUE_AMOUNT";
      }
    }

    // 更新匹配的代收訂單
    if (matchedDeposit) {
      const updated = await prisma.deposit.update({
        where: { id: matchedDeposit.id },
        data: {
          status: "MATCHING",
          utr: utr || matchedDeposit.utr,
          payerName: payerName || matchedDeposit.payerName,
          matchedAt: new Date(),
        },
      });

      // TODO: 計算代理佣金

      return NextResponse.json({
        success: true,
        matched: true,
        strategy: matchStrategy,
        deposit: updated,
      });
    }

    // 無法匹配
    return NextResponse.json({
      success: true,
      matched: false,
      message: "無法自動匹配，將保留待人工處理",
    });
  } catch (error) {
    console.error("Matching process error:", error);
    return NextResponse.json({ error: "處理失敗" }, { status: 500 });
  }
}