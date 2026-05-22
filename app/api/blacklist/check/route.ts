import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/blacklist/check - Check if value is blacklisted
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, value } = body;

    if (!type || !value) {
      return NextResponse.json({ error: "請提供類型與值" }, { status: 400 });
    }

    const blacklist = await prisma.blacklist.findFirst({
      where: {
        type: type.toUpperCase(),
        value,
      },
    });

    return NextResponse.json({
      isBlacklisted: !!blacklist,
      reason: blacklist?.reason || null,
    });
  } catch (error) {
    console.error("Blacklist check error:", error);
    return NextResponse.json({ error: "檢查失敗" }, { status: 500 });
  }
}