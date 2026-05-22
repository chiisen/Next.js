import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/blacklist - Query blacklist
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "未登入" }, { status: 401 });
    }

    // TODO: 檢查是否為 ADMIN

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const where: Record<string, unknown> = {};
    if (type) where.type = type.toUpperCase();

    const blacklist = await prisma.blacklist.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ blacklist });
  } catch (error) {
    console.error("Query blacklist error:", error);
    return NextResponse.json({ error: "查詢失敗" }, { status: 500 });
  }
}

// POST /api/blacklist - Add to blacklist
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "未登入" }, { status: 401 });
    }

    // TODO: 檢查是否為 ADMIN

    const body = await request.json();
    const { type, value, reason } = body;

    if (!type || !value) {
      return NextResponse.json(
        { error: "請提供類型與值" },
        { status: 400 }
      );
    }

    // 檢查是否已存在
    const existing = await prisma.blacklist.findFirst({
      where: {
        type: type.toUpperCase(),
        value,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "此項目已在黑名單中" },
        { status: 400 }
      );
    }

    const entry = await prisma.blacklist.create({
      data: {
        type: type.toUpperCase(),
        value,
        reason: reason || null,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error("Add to blacklist error:", error);
    return NextResponse.json({ error: "新增失敗" }, { status: 500 });
  }
}

// DELETE /api/blacklist - Remove from blacklist
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "未登入" }, { status: 401 });
    }

    // TODO: 檢查是否為 ADMIN

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "請提供 ID" }, { status: 400 });
    }

    await prisma.blacklist.delete({
      where: { id },
    });

    return NextResponse.json({ message: "已從黑名單移除" });
  } catch (error) {
    console.error("Remove from blacklist error:", error);
    return NextResponse.json({ error: "刪除失敗" }, { status: 500 });
  }
}