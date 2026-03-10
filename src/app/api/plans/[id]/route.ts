import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const updated = await prisma.contentPlan.update({
    where: { id },
    data: {
      accountId: body.accountId,
      date: body.date ? new Date(body.date) : undefined,
      title: body.title,
      caption: body.caption,
      prompt: body.prompt,
      selectedProvider: body.selectedProvider,
      mediaType: body.mediaType,
      status: body.status,
      notes: body.notes,
      imageUrl: body.imageUrl,
    },
    include: { account: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.contentPlan.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
