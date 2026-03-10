import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const accounts = await prisma.account.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { plans: true } } },
  });
  return NextResponse.json(accounts);
}

export async function POST(request: Request) {
  const body = await request.json();
  const account = await prisma.account.create({
    data: {
      name: body.name,
      handle: body.handle,
      niche: body.niche || null,
      defaultProvider: body.defaultProvider || 'OPENAI',
      defaultPrompt: body.defaultPrompt || null,
      timezone: body.timezone || 'Europe/Madrid',
      active: body.active ?? true,
    },
  });
  return NextResponse.json(account, { status: 201 });
}
