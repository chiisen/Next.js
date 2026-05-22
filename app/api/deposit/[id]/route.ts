import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/deposit/[id] - Query deposit by ID
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

    const deposit = await prisma.deposit.findUnique({
      where: { id },
      include: {
        merchant: {
          select: { id: true, name: true, email: true },
        },
        bankAccount: true,
        channel: true,
      },
    });

    if (!deposit) {
      return NextResponse.json({ error: "找不到該筆代收訂單" }, { status: 404 });
    }

    return NextResponse.json({ deposit });
  } catch (error) {
    console.error("Query deposit by ID error:", error);
    return NextResponse.json({ error: "查詢失敗" }, { status: 500 });
  }
}