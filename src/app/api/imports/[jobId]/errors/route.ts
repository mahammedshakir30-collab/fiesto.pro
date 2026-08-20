import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const job = await prisma.importJob.findUnique({
      where: { id: params.jobId },
      include: { festival: true }
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // In a real app we might check if the user is authorized for this festival
    // but the session and auth layout mostly handle this.

    if (!job.errors) {
      return new NextResponse("No errors found", { status: 404 });
    }

    const errors = job.errors as any[];
    if (!Array.isArray(errors) || errors.length === 0) {
      return new NextResponse("No errors found", { status: 404 });
    }

    // Convert errors to CSV
    // Format: Row, Field, Issue
    const csvHeader = "Row,Field,Issue\n";
    const csvRows = errors.map(e => {
      // escape quotes
      const issue = e.issue ? e.issue.replace(/"/g, '""') : '';
      return `${e.row},${e.field},"${issue}"`;
    }).join("\n");

    const csvData = csvHeader + csvRows;

    return new NextResponse(csvData, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="import_errors_${job.entity}_${job.id}.csv"`,
      },
    });

  } catch (error) {
    console.error("Error generating error CSV:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
