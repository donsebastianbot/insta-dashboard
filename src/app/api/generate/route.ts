import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const mockImages = [
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1499084732479-de2c02d45fc4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
];

export async function POST(request: Request) {
  const { planId } = await request.json();
  const imageUrl = mockImages[Math.floor(Math.random() * mockImages.length)];

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
