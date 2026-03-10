import { PrismaClient, AiProvider, PlanStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.contentPlan.deleteMany();
  await prisma.account.deleteMany();

  const cuentas = await Promise.all([
    prisma.account.create({
      data: {
        name: 'Travel Vibes ES',
        handle: '@travelvibes_es',
        niche: 'Viajes',
        defaultProvider: AiProvider.FLUX,
        defaultPrompt: 'Fotografía editorial de viajes, luz natural, composición cinematográfica',
      },
    }),
    prisma.account.create({
      data: {
        name: 'Healthy Bites',
        handle: '@healthybites.daily',
        niche: 'Comida saludable',
        defaultProvider: AiProvider.OPENAI,
        defaultPrompt: 'Food photography premium, fondo limpio, colores vibrantes',
      },
    }),
  ]);

  const today = new Date();

  for (const c of cuentas) {
    for (let i = 0; i < 5; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      await prisma.contentPlan.create({
        data: {
          accountId: c.id,
          date: d,
          title: `${c.name} · Post día ${i + 1}`,
          caption: 'Copy pendiente de revisión final.',
          prompt: c.defaultPrompt || 'Imagen estética para Instagram',
          selectedProvider: c.defaultProvider,
          status: i === 0 ? PlanStatus.GENERATED : PlanStatus.PLANNED,
          imageUrl:
            i === 0
              ? 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1200&q=80'
              : null,
        },
      });
    }
  }

  console.log('Seed OK');
}

main().finally(async () => prisma.$disconnect());
