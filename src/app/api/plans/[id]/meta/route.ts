import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function buildHashtags(topic: string, platform: 'INSTAGRAM' | 'TIKTOK') {
  const base = topic
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúñ\s]/gi, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5)
    .map((w) => `#${w}`);

  const common = platform === 'INSTAGRAM'
    ? ['#instagood', '#reels', '#contentcreator', '#marketingdigital']
    : ['#fyp', '#parati', '#viral', '#tiktokspain'];

  return [...new Set([...base, ...common])].slice(0, 10).join(' ');
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const plan = await prisma.contentPlan.findUnique({
    where: { id },
    include: { account: true },
  });

  if (!plan) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  const topic = plan.prompt || plan.title;
  const tags = buildHashtags(topic, plan.account.platform as 'INSTAGRAM' | 'TIKTOK');

  const caption = plan.account.platform === 'INSTAGRAM'
    ? `✨ ${plan.title}\n\n${topic}.\n\nGuárdalo para más tarde y cuéntame en comentarios qué opinas 👇\n\n${tags}`
    : `🚀 ${plan.title}\n${topic}\n\n¿Te gustaría ver más contenido así? ${tags}`;

  const updated = await prisma.contentPlan.update({
    where: { id },
    data: {
      caption,
      tags,
    },
    include: { account: true, stats: true },
  });

  return NextResponse.json(updated);
}
