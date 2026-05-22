import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/admin/review - Query pending withdraw requests for review
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "未登入" }, { status: 401 });
    }

    // TODO: Check if user has ADMIN role

    const withdraws = await prisma.withdraw.findMany({
      where: { status: "PENDING_REVIEW" },
      include: {
        merchant: {
          select: { id: true, name: true, email: true },
        },
        channel: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ withdraws });
  } catch (error) {
    console.error("Query pending review error:", error);
    return NextResponse.json({ error: "查詢失敗" }, { status: 500 });
  }
}

// POST /api/admin/review - Approve or reject withdraw request
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "未登入" }, { status: 401 });
    }

    // TODO: Check if user has ADMIN role

    const body = await request.json();
    const { withdrawId, action, note } = body;

    if (!withdrawId || !action) {
      return NextResponse.json({ error: "請提供參數" }, { status: 400 });
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "無效的操作" }, { status: 400 });
    }

    const withdraw = await prisma.withdraw.findUnique({
      where: { id: withdrawId },
    });

    if (!withdraw) {
      return NextResponse.json({ error: "找不到該筆代付請求" }, { status: 404 });
    }

    if (withdraw.status !== "PENDING_REVIEW") {
      return NextResponse.json({ error: "該請求已處理" }, { status: 400 });
    }

    const adminId = session.user.id;
    const newStatus = action === "approve" ? "APPROVED" : "REJECTED";

    const updated = await prisma.withdraw.update({
      where: { id: withdrawId },
      data: {
        status: newStatus,
        reviewedAt: new Date(),
        reviewedBy: adminId,
      },
    });

    // TODO: 如果核准，應該觸發第三方支付並扣款

    return NextResponse.json({
      withdraw: updated,
      action,
      note: note || null,
    });
  } catch (error) {
    console.error("Review withdraw error:", error);
    return NextResponse.json({ error: "處理失敗" }, { status: 500 });
  }
}