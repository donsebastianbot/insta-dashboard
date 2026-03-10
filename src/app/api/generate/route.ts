import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const mockImages = [
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1499084732479-de2c02d45fc4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
];

const mockVideos = [
  'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
  'https://samplelib.com/lib/preview/mp4/sample-10s.mp4',
];

export async function POST(request: Request) {
  const { planId } = await request.json();
  const current = await prisma.contentPlan.findUnique({ where: { id: planId } });
  if (!current) return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 });

  const imageUrl = current.mediaType === 'VIDEO'
    ? mockVideos[Math.floor(Math.random() * mockVideos.length)]
    : mockImages[Math.floor(Math.random() * mockImages.length)];

  const updated = await prisma.contentPlan.update({
    where: { id: planId },
    data: {
      imageUrl,
      status: 'GENERATED',
    },
    include: { account: true },
  });

  return NextResponse.json(updated);
}
