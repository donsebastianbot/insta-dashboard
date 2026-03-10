import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function eachDay(start: Date, end: Date) {
  const dates: Date[] = [];
  const d = new Date(start);
  while (d <= end) {
    dates.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

export async function POST(request: Request) {
  const body = await request.json();
  const { accountId, startDate, endDate, topic, mediaType, selectedProvider } = body;

  if (!accountId || !startDate || !endDate || !topic) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (end < start) {
    return NextResponse.json({ error: 'El rango de fechas no es válido' }, { status: 400 });
  }

  const days = eachDay(start, end);

  const created = await Promise.all(
    days.map((date, i) =>
      prisma.contentPlan.create({
        data: {
          accountId,
          date,
          title: `${topic} · Día ${i + 1}`,
          caption: `Contenido automático sobre: ${topic}`,
          prompt: `Crear ${mediaType === 'VIDEO' ? 'un video' : 'una imagen'} para redes sociales sobre: ${topic}`,
          selectedProvider: selectedProvider || 'OPENAI',
          mediaType: mediaType || 'IMAGE',
          status: 'PLANNED',
        },
      })
    )
  );

  return NextResponse.json({ ok: true, count: created.length });
}
