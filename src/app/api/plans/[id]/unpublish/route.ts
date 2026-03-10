import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const plan = await prisma.contentPlan.findUnique({
    where: { id },
    include: { account: { include: { connections: true } } },
  });

  if (!plan) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  let remoteDeleted = false;
  let warning: string | null = null;

  if (plan.externalPostId) {
    const conn = plan.account.connections.find((c) => c.platform === plan.account.platform);

    if (plan.account.platform === 'INSTAGRAM' && conn?.accessToken) {
      try {
        const res = await fetch(
          `https://graph.facebook.com/v20.0/${plan.externalPostId}?access_token=${conn.accessToken}`,
          { method: 'DELETE' }
        );
        remoteDeleted = res.ok;
        if (!res.ok) warning = 'No se pudo despublicar en Instagram API.';
      } catch {
        warning = 'Error de red al despublicar en Instagram.';
      }
    } else if (plan.account.platform === 'TIKTOK') {
      warning = 'Despublicación real en TikTok pendiente de endpoint final.';
    }
  }

  const updated = await prisma.contentPlan.update({
    where: { id },
    data: {
      status: 'SCHEDULED',
      externalPostId: null,
    },
    include: { account: true },
  });

  return NextResponse.json({ ok: true, remoteDeleted, warning, plan: updated });
}
