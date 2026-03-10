import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const plan = await prisma.contentPlan.findUnique({
    where: { id },
    include: { account: { include: { connections: true } } },
  });

  if (!plan) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  if (plan.status !== 'GENERATED') {
    return NextResponse.json({ error: 'Solo se puede publicar contenido generado' }, { status: 400 });
  }

  const conn = plan.account.connections.find((c) => c.platform === plan.account.platform);

  let remotePostId = plan.externalPostId || null;
  let warning: string | null = null;

  // Instagram publish attempt (image only for now)
  if (plan.account.platform === 'INSTAGRAM' && conn?.accessToken && plan.imageUrl && plan.mediaType === 'IMAGE') {
    try {
      const createContainer = await fetch(
        `https://graph.facebook.com/v20.0/${conn.externalUserId}/media`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            image_url: plan.imageUrl,
            caption: plan.caption || '',
            access_token: conn.accessToken,
          }),
        }
      );

      if (createContainer.ok) {
        const containerJson = await createContainer.json();
        const creationId = containerJson.id;

        const publish = await fetch(
          `https://graph.facebook.com/v20.0/${conn.externalUserId}/media_publish`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              creation_id: creationId,
              access_token: conn.accessToken,
            }),
          }
        );

        if (publish.ok) {
          const publishJson = await publish.json();
          remotePostId = String(publishJson.id || creationId);
        } else {
          warning = 'No se pudo publicar en Instagram API. Publicada en modo local.';
          remotePostId = `local_${Date.now()}`;
        }
      } else {
        warning = 'Error al crear contenedor en Instagram. Publicada en modo local.';
        remotePostId = `local_${Date.now()}`;
      }
    } catch {
      warning = 'Error de red al publicar en Instagram. Publicada en modo local.';
      remotePostId = `local_${Date.now()}`;
    }
  } else {
    // Fallback/local publish (also for VIDEO and TikTok for now)
    if (plan.account.platform === 'TIKTOK') {
      warning = 'Publicación real en TikTok pendiente de integración final. Marcada como publicada localmente.';
    }
    remotePostId = remotePostId || `local_${Date.now()}`;
  }

  const updated = await prisma.contentPlan.update({
    where: { id },
    data: {
      status: 'PUBLISHED',
      externalPostId: remotePostId,
    },
    include: { account: true },
  });

  return NextResponse.json({ ok: true, warning, plan: updated });
}
