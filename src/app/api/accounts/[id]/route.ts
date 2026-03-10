import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const updated = await prisma.account.update({
    where: { id },
    data: {
      name: body.name,
      handle: body.handle,
      niche: body.niche,
      defaultProvider: body.defaultProvider,
      defaultPrompt: body.defaultPrompt,
      timezone: body.timezone,
      active: body.active,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.account.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
