import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const festivalId = searchParams.get('festivalId');
    const programmeId = searchParams.get('programmeId');
    const q = searchParams.get('q') || '';

    if (!festivalId) return new NextResponse("Missing festivalId", { status: 400 });

    const whereClause: any = {
      festivalId,
      name: { contains: q, mode: 'insensitive' }
    };

    if (programmeId) {
      whereClause.registrations = {
        some: { programmeId }
      };
    }

    const candidates = await prisma.candidate.findMany({
      where: whereClause,
      take: 20,
      select: {
        id: true,
        name: true,
        chestNumber: true,
        team: {
          select: { name: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(candidates);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
