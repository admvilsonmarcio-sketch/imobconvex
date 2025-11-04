import { useEffect, useState } from "react";

import Head from "next/head";

import { LeadForm } from "@/components/LeadForm";
import { PropertyCard } from "@/components/PropertyCard";
import { api } from "@/lib/api";
import type { Property, PropertiesResponse } from "@/types";

const heroStats = [
  { label: "Conversão média", value: "+40%" },
  { label: "Tempo economizado", value: "5h/dia" },
  { label: "Satisfação", value: "SUS 80+" }
];

const initialFilters = {
  city: "",
  operation: "sale",
  bedrooms: ""
};

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filters, setFilters] = useState(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadProperties(params = filters) {
    try {
      setIsLoading(true);
      setError(null);
      const response: PropertiesResponse = await api.listProperties({
        city: params.city || undefined,
        operation: params.operation,
        bedrooms: params.bedrooms || undefined
      });
      setProperties(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar imóveis");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loadProperties(filters);
  }

  return (
    <div className="min-h-screen bg-surface-100">
      <Head>
        <title>ImobConvex — Plataforma Imobiliária Inteligente</title>
      </Head>
      <header className="relative overflow-hidden bg-gradient-to-br from-primary to-secondary text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-24 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.2em]">
              Plataforma Imobiliária Inteligente
            </span>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Encante clientes com tecnologia, IA e experiência premium em cada interação.
            </h1>
            <p className="max-w-xl text-lg text-white/80">
              Portal completo, CRM com IA, automações e gestão financeira em uma única solução mobile-first desenhada para o mercado imobiliário moderno.
            </p>
            <form onSubmit={handleFilterSubmit} className="grid gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-sm sm:grid-cols-4">
              <div className="sm:col-span-2">
                <label htmlFor="city" className="text-xs uppercase tracking-widest text-white/70">
                  Cidade
                </label>
                <input
                  id="city"
                  value={filters.city}
                  onChange={(event) => setFilters((prev) => ({ ...prev, city: event.target.value }))}
                  placeholder="São Paulo, Florianópolis..."
                  className="mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/60 focus:border-white/60 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="operation" className="text-xs uppercase tracking-widest text-white/70">
                  Operação
                </label>
                <select
                  id="operation"
                  value={filters.operation}
                  onChange={(event) => setFilters((prev) => ({ ...prev, operation: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white focus:border-white/60 focus:outline-none"
                >
                  <option value="sale">Comprar</option>
                  <option value="rent">Alugar</option>
                </select>
              </div>
              <div>
                <label htmlFor="bedrooms" className="text-xs uppercase tracking-widest text-white/70">
                  Quartos mínimos
                </label>
                <input
                  id="bedrooms"
                  type="number"
                  value={filters.bedrooms}
                  onChange={(event) => setFilters((prev) => ({ ...prev, bedrooms: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white focus:border-white/60 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="flex items-center justify-center rounded-xl bg-white py-2 font-semibold text-primary transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Buscar imóveis
              </button>
            </form>
            <dl className="grid gap-4 sm:grid-cols-3">
              {heroStats.map((item) => (
                <div key={item.label} className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                  <dt className="text-sm uppercase tracking-wide text-white/70">{item.label}</dt>
                  <dd className="text-2xl font-semibold">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex-1">
            <div className="rounded-3xl bg-white/10 p-6 backdrop-blur-lg">
              <p className="text-sm uppercase tracking-wide text-white/70">Visão do corretor</p>
              <div className="mt-4 space-y-4 rounded-2xl bg-white/90 p-6 text-surface-800">
                <h2 className="text-xl font-semibold">Próximos passos automáticos</h2>
                <ul className="space-y-3 text-sm text-surface-800/80">
                  <li className="rounded-xl border border-surface-200 p-3 shadow-sm">
                    Lead quente · Sugestão: enviar proposta personalizada agora
                  </li>
                  <li className="rounded-xl border border-surface-200 p-3 shadow-sm">
                    Visita às 15h · Check-in com geolocalização habilitado
                  </li>
                  <li className="rounded-xl border border-surface-200 p-3 shadow-sm">
                    Follow-up automático enviado ontem · Sentimento positivo
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-24 px-6 py-24">
        <section className="space-y-6" id="imoveis">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-semibold text-surface-800">Imóveis em destaque</h2>
              <p className="text-surface-500">Resultados atualizados automaticamente conforme seu funil e preferências.</p>
            </div>
          </div>
          {error && <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-600">{error}</p>}
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse rounded-3xl bg-white p-6 shadow-sm">
                  <div className="h-48 rounded-2xl bg-surface-200" />
                  <div className="mt-4 h-4 rounded bg-surface-200" />
                  <div className="mt-2 h-4 w-3/4 rounded bg-surface-200" />
                  <div className="mt-6 h-10 rounded-full bg-surface-200" />
                </div>
              ))}
            </div>
          ) : properties.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-surface-300 bg-white p-12 text-center text-surface-500">
              Nenhum imóvel encontrado para este filtro. Ajuste os parâmetros e tente novamente.
            </div>
          )}
        </section>

        <section className="grid gap-10 lg:grid-cols-2" id="contato">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold text-surface-800">IA que trabalha para você</h2>
            <p className="text-lg text-surface-600">
              Nossa inteligência artificial analisa seu perfil, preferências e comportamento em tempo real para recomendar os
              imóveis ideais e sugerir os próximos passos de follow-up.
            </p>
            <ul className="space-y-3 text-surface-600">
              <li>Scoring automático em segundos.</li>
              <li>Próximas ações priorizadas por probabilidade de conversão.</li>
              <li>Recomendações personalizadas com base na disponibilidade da carteira.</li>
            </ul>
          </div>
          <LeadForm defaultCity={filters.city} />
        </section>
      </main>

      <footer className="bg-surface-800 py-12 text-surface-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-surface-100/70">© {new Date().getFullYear()} ImobConvex. Todos os direitos reservados.</p>
          <div className="flex gap-4 text-sm">
            <a href="#imoveis">Imóveis</a>
            <a href="#contato">Contato</a>
            <a href="/admin">Painel do corretor</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
