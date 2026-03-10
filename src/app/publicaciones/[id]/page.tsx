"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Plan = {
  id: string;
  title: string;
  date: string;
  prompt: string;
  caption?: string;
  tags?: string;
  imageUrl?: string;
  mediaType: 'IMAGE' | 'VIDEO';
  status: 'PLANNED' | 'GENERATED' | 'SCHEDULED' | 'PUBLISHED' | 'SKIPPED';
  account: { handle: string; platform: 'INSTAGRAM' | 'TIKTOK' };
  stats?: { likes: number; comments: number; impressions: number; reach: number; plays: number } | null;
};

export default function PublicacionDetalle({ params }: { params: Promise<{ id: string }> }) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(true);

  async function load(id: string) {
    setLoading(true);
    const r = await fetch(`/api/plans/${id}`, { cache: 'no-store' });
    const d = await r.json();
    setPlan(d);
    setPrompt(d.prompt || '');
    setLoading(false);
  }

  useEffect(() => {
    params.then((p) => load(p.id));
  }, [params]);

  async function action(path: string, method: 'POST' | 'PATCH' = 'POST', body?: any) {
    if (!plan) return;
    await fetch(path, {
      method,
      headers: { 'content-type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    await load(plan.id);
  }

  if (loading || !plan) return <main className="max-w-4xl mx-auto p-6">Cargando publicación...</main>;

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{plan.title}</h1>
        <Link href="/" className="btn-soft">← Volver al dashboard</Link>
      </div>

      <div className="card p-4 space-y-2">
        <p className="text-sm text-zinc-500">{plan.account.handle} · {plan.account.platform} · {new Date(plan.date).toLocaleDateString()}</p>
        <p><strong>Estado:</strong> {plan.status}</p>
        {plan.imageUrl && <a className="btn-soft" href={plan.imageUrl} target="_blank">Ver {plan.mediaType === 'VIDEO' ? 'vídeo' : 'imagen'}</a>}
      </div>

      <div className="card p-4 space-y-3">
        <h2 className="font-semibold">Interacción con IA</h2>
        <textarea className="input min-h-28" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" onClick={() => action('/api/generate', 'POST', { planId: plan.id, promptOverride: prompt })}>Generar / Rehacer IA</button>
          <button className="btn-soft" onClick={() => action(`/api/plans/${plan.id}/meta`)}>Generar metadatos IA</button>
          {plan.status === 'GENERATED' && plan.imageUrl && <button className="btn-soft" onClick={() => action(`/api/plans/${plan.id}/publish`)}>Publicar</button>}
          {plan.status === 'PUBLISHED' && <button className="btn-soft" onClick={() => action(`/api/plans/${plan.id}/unpublish`)}>Despublicar</button>}
          {plan.status === 'PUBLISHED' && <button className="btn-soft" onClick={() => action(`/api/plans/${plan.id}/stats`)}>Actualizar stats</button>}
        </div>
      </div>

      <div className="card p-4 space-y-2">
        <h2 className="font-semibold">Metadatos</h2>
        <p><strong>Caption:</strong> {plan.caption || '—'}</p>
        <p><strong>Tags:</strong> {plan.tags || '—'}</p>
      </div>

      {plan.status === 'PUBLISHED' && (
        <div className="card p-4">
          <h2 className="font-semibold mb-2">Estadísticas</h2>
          {plan.stats ? (
            <p>❤️ {plan.stats.likes} · 💬 {plan.stats.comments} · 👁 {plan.stats.impressions} · 📣 {plan.stats.reach} {plan.mediaType === 'VIDEO' ? `· ▶ ${plan.stats.plays}` : ''}</p>
          ) : (
            <p className="text-sm text-zinc-500">Sin estadísticas aún.</p>
          )}
        </div>
      )}
    </main>
  );
}
