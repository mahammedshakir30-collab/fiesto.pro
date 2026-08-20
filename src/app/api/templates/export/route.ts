import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ error: 'Templates export migrated to Templates v3' }, { status: 410 });
}
