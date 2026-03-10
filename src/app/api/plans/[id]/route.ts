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

  const plan = await prisma.contentPlan.findUnique({
    where: { id },
    include: { account: { include: { connections: true } } },
  });

  if (!plan) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  let remoteDeleted = false;
  let remoteWarning: string | null = null;

  if (plan.externalPostId) {
    const conn = plan.account.connections.find((c) => c.platform === plan.account.platform);

    if (conn?.accessToken && plan.account.platform === 'INSTAGRAM') {
      try {
        const res = await fetch(
          `https://graph.facebook.com/v20.0/${plan.externalPostId}?access_token=${conn.accessToken}`,
          { method: 'DELETE' }
        );
        remoteDeleted = res.ok;
        if (!res.ok) remoteWarning = 'No se pudo borrar en Instagram (API)';
      } catch {
        remoteWarning = 'Error al intentar borrar en Instagram';
      }
    } else if (plan.account.platform === 'TIKTOK') {
      remoteWarning = 'Borrado remoto TikTok pendiente de endpoint definitivo';
    }
  }

  await prisma.contentPlan.delete({ where: { id } });
  return NextResponse.json({ ok: true, remoteDeleted, remoteWarning });
}
