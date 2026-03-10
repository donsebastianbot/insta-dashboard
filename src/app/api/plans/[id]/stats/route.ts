import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const plan = await prisma.contentPlan.findUnique({
    where: { id },
    include: { account: { include: { connections: true } }, stats: true },
  });

  if (!plan) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  if (plan.status !== 'PUBLISHED') {
    return NextResponse.json({ error: 'Solo hay estadísticas para posts publicados' }, { status: 400 });
  }

  let stats = {
    likes: Math.floor(Math.random() * 300),
    comments: Math.floor(Math.random() * 40),
    impressions: 500 + Math.floor(Math.random() * 5000),
    reach: 300 + Math.floor(Math.random() * 3500),
    plays: plan.mediaType === 'VIDEO' ? 800 + Math.floor(Math.random() * 8000) : 0,
  };

  // Optional best-effort Instagram real insights (if available)
  try {
    const conn = plan.account.connections.find((c) => c.platform === 'INSTAGRAM');
    if (conn?.accessToken && plan.externalPostId && !String(plan.externalPostId).startsWith('local_')) {
      const res = await fetch(
        `https://graph.facebook.com/v20.0/${plan.externalPostId}/insights?metric=impressions,reach,likes,comments,saved&access_token=${conn.accessToken}`
      );
      if (res.ok) {
        const json = await res.json();
        const data: Array<{ name: string; values?: Array<{ value: number }> }> = json.data || [];
        const get = (name: string) => data.find((x) => x.name === name)?.values?.[0]?.value;
        stats = {
          ...stats,
          likes: Number(get('likes') ?? stats.likes),
          comments: Number(get('comments') ?? stats.comments),
          impressions: Number(get('impressions') ?? stats.impressions),
          reach: Number(get('reach') ?? stats.reach),
        };
      }
    }
  } catch {
    // keep mock stats fallback
  }

  const updated = await prisma.postStats.upsert({
    where: { planId: id },
    update: stats,
    create: { planId: id, ...stats },
  });

  return NextResponse.json(updated);
}
