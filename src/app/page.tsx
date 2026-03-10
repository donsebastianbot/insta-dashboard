"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

type Account = {
  id: string;
  name: string;
  handle: string;
  niche?: string;
  defaultProvider: 'OPENAI' | 'REPLICATE' | 'STABILITY' | 'MIDJOURNEY' | 'FLUX';
  defaultPrompt?: string;
  active: boolean;
  timezone: string;
  _count?: { plans: number };
};

type Plan = {
  id: string;
  accountId: string;
  date: string;
  title: string;
  caption?: string;
  prompt: string;
  selectedProvider: Account['defaultProvider'];
  status: 'PLANNED' | 'GENERATED' | 'SCHEDULED' | 'PUBLISHED' | 'SKIPPED';
  imageUrl?: string;
  notes?: string;
  account: Account;
};

const providers = ['OPENAI', 'REPLICATE', 'STABILITY', 'MIDJOURNEY', 'FLUX'] as const;

export default function Page() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selected, setSelected] = useState<string>('ALL');

  const [newPlan, setNewPlan] = useState({
    accountId: '',
    date: new Date().toISOString().slice(0, 10),
    title: '',
    prompt: '',
    selectedProvider: 'OPENAI',
  });

  async function load() {
    const [a, p] = await Promise.all([fetch('/api/accounts'), fetch('/api/plans')]);
    setAccounts(await a.json());
    setPlans(await p.json());
  }

  useEffect(() => {
    load();
  }, []);

  const filteredPlans = useMemo(() => {
    if (selected === 'ALL') return plans;
    return plans.filter((p) => p.accountId === selected);
  }, [plans, selected]);

  const metrics = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const dueToday = plans.filter((p) => p.date.slice(0, 10) === today).length;
    const generated = plans.filter((p) => p.status === 'GENERATED').length;
    const published = plans.filter((p) => p.status === 'PUBLISHED').length;
    return { accounts: accounts.length, dueToday, generated, published };
  }, [accounts, plans]);

  async function createPlan(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/plans', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(newPlan),
    });
    setNewPlan({ ...newPlan, title: '', prompt: '' });
    await load();
  }

  async function generateImage(planId: string) {
    await fetch('/api/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ planId }),
    });
    await load();
  }

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      <header className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">InstaPilot Dashboard</h1>
            <p className="text-zinc-500 text-sm mt-1">Gestiona cuentas de Instagram, planificación diaria y generación de imágenes por IA.</p>
          </div>
          <Link href="/api/instagram/connect" className="btn-primary">Conectar cuenta Instagram</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          <Stat label="Cuentas" value={metrics.accounts} />
          <Stat label="Posts hoy" value={metrics.dueToday} />
          <Stat label="Generadas" value={metrics.generated} />
          <Stat label="Publicadas" value={metrics.published} />
        </div>
      </header>

      <section className="grid lg:grid-cols-2 gap-4">
        <div className="card p-4 space-y-3">
          <h2 className="font-semibold">Cuentas conectadas</h2>
          <p className="text-sm text-zinc-500">Conecta cuentas reales desde el botón superior. No se crean manualmente aquí.</p>
          <div className="space-y-2">
            {accounts.map((a) => (
              <div key={a.id} className="rounded-xl border border-zinc-200 p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{a.handle}</p>
                  <p className="text-xs text-zinc-500">{a.name} · {a.defaultProvider}</p>
                </div>
                <span className="badge">{a.active ? 'Conectada' : 'Inactiva'}</span>
              </div>
            ))}
            {accounts.length === 0 && <p className="text-sm text-zinc-500">Aún no hay cuentas conectadas.</p>}
          </div>
        </div>

        <form onSubmit={createPlan} className="card p-4 space-y-2">
          <h2 className="font-semibold">Asignar publicación diaria</h2>
          <select className="input" value={newPlan.accountId} onChange={(e) => setNewPlan({ ...newPlan, accountId: e.target.value })} required>
            <option value="">Selecciona cuenta</option>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.handle}</option>)}
          </select>
          <input className="input" type="date" value={newPlan.date} onChange={(e) => setNewPlan({ ...newPlan, date: e.target.value })} required />
          <input className="input" placeholder="Título del post" value={newPlan.title} onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })} required />
          <textarea className="input min-h-20" placeholder="Prompt de imagen" value={newPlan.prompt} onChange={(e) => setNewPlan({ ...newPlan, prompt: e.target.value })} required />
          <select className="input" value={newPlan.selectedProvider} onChange={(e) => setNewPlan({ ...newPlan, selectedProvider: e.target.value as any })}>
            {providers.map((p) => <option key={p}>{p}</option>)}
          </select>
          <button className="btn-primary">Guardar planificación</button>
        </form>
      </section>

      <section className="card p-4">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h2 className="font-semibold">Calendario de publicaciones</h2>
          <select className="input max-w-64" value={selected} onChange={(e) => setSelected(e.target.value)}>
            <option value="ALL">Todas las cuentas</option>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.handle}</option>)}
          </select>
        </div>

        <div className="space-y-3">
          {filteredPlans.map((p) => (
            <article key={p.id} className="rounded-xl border border-zinc-200 p-3 grid md:grid-cols-6 gap-3 items-center">
              <div className="md:col-span-2">
                <p className="font-medium">{p.title}</p>
                <p className="text-xs text-zinc-500">{p.account.handle} · {format(new Date(p.date), 'dd/MM/yyyy')}</p>
              </div>
              <div className="text-xs"><span className="badge">{p.selectedProvider}</span></div>
              <div className="text-xs"><span className="badge">{p.status}</span></div>
              <div className="md:col-span-2 flex items-center gap-2 justify-end">
                {p.imageUrl ? <a className="btn-soft" target="_blank" href={p.imageUrl}>Ver imagen</a> : null}
                <button className="btn-primary" onClick={() => generateImage(p.id)}>Generar IA</button>
              </div>
            </article>
          ))}
          {filteredPlans.length === 0 && <p className="text-sm text-zinc-500">No hay publicaciones planificadas.</p>}
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
