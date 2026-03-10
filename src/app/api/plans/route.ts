import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const plans = await prisma.contentPlan.findMany({
    include: { account: true, stats: true },
    orderBy: [{ date: 'asc' }, { createdAt: 'desc' }],
  });
  return NextResponse.json(plans);
}

export async function POST(request: Request) {
  const body = await request.json();
  const plan = await prisma.contentPlan.create({
    data: {
      accountId: body.accountId,
      date: new Date(body.date),
      title: body.title,
      caption: body.caption || null,
      prompt: body.prompt,
      selectedProvider: body.selectedProvider,
      mediaType: body.mediaType || 'IMAGE',
      status: body.status || 'PLANNED',
      notes: body.notes || null,
      imageUrl: body.imageUrl || null,
    },
    include: { account: true },
  });
  return NextResponse.json(plan, { status: 201 });
}
