import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/commissions/calculate - Calculate agent commissions for a deposit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { depositId } = body;

    if (!depositId) {
      return NextResponse.json({ error: "請提供 depositId" }, { status: 400 });
    }

    const deposit = await prisma.deposit.findUnique({
      where: { id: depositId },
      include: {
        merchant: {
          include: {
            parent: true, // Agent
          },
        },
        channel: true,
      },
    });

    if (!deposit) {
      return NextResponse.json({ error: "找不到該筆代收" }, { status: 404 });
    }

    if (!deposit.merchant.parent) {
      // 商戶沒有上層代理，不計算佣金
      return NextResponse.json({
        message: "該商戶無上級代理，不計算佣金",
        commissions: [],
      });
    }

    const merchant = deposit.merchant;
    const agent = merchant.parent!;
    const agentId = agent.id;

    // 查詢費率
    const feeConfig = await prisma.agentChannelConfig.findFirst({
      where: {
        agentId,
        channelId: deposit.channelId || undefined,
      },
      include: {
        feeGroup: {
          include: {
            rules: true,
          },
        },
      },
    });

    if (!feeConfig?.feeGroup?.rules?.length) {
      return NextResponse.json({
        message: "無可用費率設定",
        commissions: [],
      });
    }

    const rules = feeConfig.feeGroup.rules;
    const depositAmount = Number(deposit.amount);

    // 計算佣金
    const commissions = [];
    let currentAgentId: string | null = agent.id;
    let level = 1;

    while (currentAgentId && level <= 3) {
      const agentConfig = await prisma.agentChannelConfig.findFirst({
        where: {
          agentId: currentAgentId,
          channelId: deposit.channelId || undefined,
        },
        include: {
          feeGroup: {
            include: { rules: true },
          },
        },
      });

      if (!agentConfig?.feeGroup?.rules?.length) {
        break;
      }

      const applicableRule = agentConfig.feeGroup.rules.find(
        (rule) =>
          rule.channelId === deposit.channelId &&
          depositAmount >= Number(rule.minAmount || 0) &&
          depositAmount <= Number(rule.maxAmount || Infinity)
      );

      if (applicableRule) {
        let commissionAmount = 0;
        if (applicableRule.type === "PERCENTAGE") {
          commissionAmount =
            (depositAmount * Number(applicableRule.value)) / 100;
        } else {
          commissionAmount = Number(applicableRule.value);
        }

        const commission = await prisma.agentCommission.create({
          data: {
            agentId: currentAgentId,
            depositId: deposit.id,
            level,
            rate: applicableRule.value,
            amount: commissionAmount,
            feeGroupId: agentConfig.feeGroupId,
          },
        });

        commissions.push(commission);

        // 找上層代理
        const parentAgent: { parentId: string | null } | null =
          await prisma.user.findUnique({
            where: { id: currentAgentId },
            select: { parentId: true },
          });
        currentAgentId = parentAgent?.parentId ?? null;
        level++;
      } else {
        break;
      }
    }

    return NextResponse.json({
      depositId,
      commissions,
      totalCommission: commissions.reduce(
        (sum, c) => sum + Number(c.amount),
        0
      ),
    });
  } catch (error) {
    console.error("Calculate commission error:", error);
    return NextResponse.json({ error: "計算失敗" }, { status: 500 });
  }
}