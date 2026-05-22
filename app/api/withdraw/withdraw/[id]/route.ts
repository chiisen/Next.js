import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/withdraw/withdraw/[id] - Query withdraw by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "未登入" }, { status: 401 });
    }

    const { id } = await params;

    const withdraw = await prisma.withdraw.findUnique({
      where: { id },
      include: {
        merchant: {
          select: { id: true, name: true, email: true },
        },
        channel: true,
      },
    });

    if (!withdraw) {
      return NextResponse.json({ error: "找不到該筆代付訂單" }, { status: 404 });
    }

    return NextResponse.json({ withdraw });
  } catch (error) {
    console.error("Query withdraw by ID error:", error);
    return NextResponse.json({ error: "查詢失敗" }, { status: 500 });
  }
}