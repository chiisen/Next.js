import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// POST /api/bank-accounts/allocate - Allocate bank account to merchant
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "未登入" }, { status: 401 });
    }

    const body = await request.json();
    const { merchantId, groupId } = body;

    const targetMerchantId = merchantId || session.user.id;

    // 查詢可用帳號
    const availableAccount = await prisma.bankAccount.findFirst({
      where: {
        isAllocated: false,
        status: "ACTIVE",
        ...(groupId ? { groupId } : {}),
      },
      include: {
        bank: true,
        group: true,
      },
      orderBy: {
        createdAt: "asc", // FIFO - 先到先分配
      },
    });

    if (!availableAccount) {
      return NextResponse.json(
        { error: "目前沒有可用的銀行帳號" },
        { status: 404 }
      );
    }

    // 更新帳號狀態為已分配
    const updatedAccount = await prisma.bankAccount.update({
      where: { id: availableAccount.id },
      data: {
        isAllocated: true,
        allocatedTo: targetMerchantId,
      },
      include: {
        bank: true,
        group: true,
      },
    });

    return NextResponse.json({
      bankAccount: updatedAccount,
      message: "帳號分配成功",
    });
  } catch (error) {
    console.error("Allocate bank account error:", error);
    return NextResponse.json({ error: "分配失敗" }, { status: 500 });
  }
}

// DELETE /api/bank-accounts/allocate - Release bank account
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "未登入" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");

    if (!accountId) {
      return NextResponse.json({ error: "請提供帳號 ID" }, { status: 400 });
    }

    // 釋放帳號
    const updatedAccount = await prisma.bankAccount.update({
      where: { id: accountId },
      data: {
        isAllocated: false,
        allocatedTo: null,
      },
    });

    return NextResponse.json({
      bankAccount: updatedAccount,
      message: "帳號已釋放",
    });
  } catch (error) {
    console.error("Release bank account error:", error);
    return NextResponse.json({ error: "釋放失敗" }, { status: 500 });
  }
}