import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  if (!prisma) {
    return NextResponse.json(
      {
        ok: false,
        database: "missing",
      },
      { status: 500 },
    );
  }

  try {
    await prisma.category.count();

    return NextResponse.json({
      ok: true,
      database: "connected",
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        database: "unreachable",
      },
      { status: 500 },
    );
  }
}
