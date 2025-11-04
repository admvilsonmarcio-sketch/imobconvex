import { useEffect, useMemo, useState } from "react";

import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { api } from "@/lib/api";
import type { Lead, Property, PropertyFormPayload } from "@/types";

const emptyProperty: PropertyFormPayload = {
  slug: "",
  title: "",
  description: "",
  price: 0,
  property_type: "apartment",
  operation: "sale",
  status: "available",
  bedrooms: 2,
  bathrooms: 2,
  parking_spaces: 1,
  area: 60,
  address_line: "",
  city: "",
  state: "",
  country: "Brasil",
  latitude: null,
  longitude: null,
  cover_image_url: "",
  gallery: [],
  amenities: [],
  tags: []
};

export default function AdminDashboard() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProperty);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("imobconvex_token");
    if (!storedToken) {
      router.replace("/admin/login");
      return;
    }
    setToken(storedToken);
    void fetchData(storedToken);
  }, [router]);

  async function fetchData(authToken: string) {
    try {
      setIsLoading(true);
      setError(null);
      const [propertiesResponse, leadsResponse] = await Promise.all([
        api.listProperties({ limit: 50 }),
        api.listLeads(authToken)
      ]);
      setProperties(propertiesResponse.data);
      setLeads(leadsResponse.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar dados");
      if (err instanceof Error && err.message.includes("401")) {
        localStorage.removeItem("imobconvex_token");
        router.replace("/admin/login");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateProperty(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setIsSaving(true);
    setError(null);
    try {
      const payload: PropertyFormPayload = {
        ...form,
        price: Number(form.price),
        bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
        parking_spaces: form.parking_spaces ? Number(form.parking_spaces) : null,
        area: form.area ? Number(form.area) : null,
        gallery: form.gallery.filter(Boolean),
        amenities: form.amenities.filter(Boolean),
        tags: form.tags.filter(Boolean)
      } as PropertyFormPayload;
      await api.createProperty(payload, token);
      setForm(emptyProperty);
      await fetchData(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar o imóvel");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteProperty(id: number) {
    if (!token) return;
    if (!confirm("Remover este imóvel?")) return;
    try {
      await api.deleteProperty(id, token);
      await fetchData(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao remover imóvel");
    }
  }

  const leadsResume = useMemo(() => {
    if (leads.length === 0) return { hot: 0, warm: 0, cold: 0 };
    return leads.reduce(
      (acc, lead) => {
        if (lead.status === "HOT") acc.hot += 1;
        else if (lead.status === "WARM") acc.warm += 1;
        else acc.cold += 1;
        return acc;
      },
      { hot: 0, warm: 0, cold: 0 }
    );
  }, [leads]);

  if (!token && !isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <Head>
        <title>Painel administrativo · ImobConvex</title>
      </Head>
      <header className="border-b border-surface-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div>
            <h1 className="text-2xl font-semibold text-surface-900">Painel administrativo</h1>
            <p className="text-sm text-surface-500">Gerencie imóveis, leads e acompanhe o desempenho da equipe.</p>
          </div>
          <Link href="/" className="text-sm font-semibold text-primary hover:underline">
            Voltar ao portal
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-12 px-6 py-12">
        {error && <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-600">{error}</p>}

        <section className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-wide text-surface-500">Imóveis ativos</p>
            <p className="mt-2 text-3xl font-semibold text-surface-900">{properties.length}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-wide text-surface-500">Leads quentes</p>
            <p className="mt-2 text-3xl font-semibold text-primary">{leadsResume.hot}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-wide text-surface-500">Leads para nutrir</p>
            <p className="mt-2 text-3xl font-semibold text-secondary">{leadsResume.warm + leadsResume.cold}</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="rounded-3xl border border-surface-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-surface-900">Imóveis cadastrados</h2>
              <button
                type="button"
                onClick={() => token && fetchData(token)}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Atualizar
              </button>
            </div>
            <div className="mt-4 space-y-4">
              {isLoading ? (
                <p className="text-sm text-surface-500">Carregando...</p>
              ) : properties.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-surface-200 p-6 text-center text-sm text-surface-500">
                  Nenhum imóvel cadastrado ainda.
                </p>
              ) : (
                properties.map((property) => (
                  <div key={property.id} className="flex flex-col gap-3 rounded-2xl border border-surface-200 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-wide text-surface-500">{property.slug}</p>
                      <p className="text-lg font-semibold text-surface-900">{property.title}</p>
                      <p className="text-sm text-surface-500">
                        {property.city} · {property.state} · {new Date(property.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/properties/${property.slug}`}
                        className="rounded-full border border-surface-200 px-4 py-2 text-sm font-semibold text-surface-600 hover:border-primary hover:text-primary"
                      >
                        Ver no portal
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteProperty(property.id)}
                        className="rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-200"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-surface-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-surface-900">Cadastrar novo imóvel</h2>
            <form onSubmit={handleCreateProperty} className="mt-4 grid gap-3">
              <input
                placeholder="Slug (ex: apto-vista-mar)"
                value={form.slug}
                onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
                className="rounded-xl border border-surface-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
              <input
                placeholder="Título"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                className="rounded-xl border border-surface-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
              <textarea
                placeholder="Descrição"
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                className="rounded-xl border border-surface-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={3}
                required
              />
              <input
                placeholder="Endereço completo"
                value={form.address_line}
                onChange={(event) => setForm((prev) => ({ ...prev, address_line: event.target.value }))}
                className="rounded-xl border border-surface-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
              <input
                type="number"
                placeholder="Preço (R$)"
                value={form.price}
                onChange={(event) => setForm((prev) => ({ ...prev, price: Number(event.target.value) }))}
                className="rounded-xl border border-surface-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
              <input
                placeholder="URL da imagem de capa (opcional)"
                value={form.cover_image_url ?? ""}
                onChange={(event) => setForm((prev) => ({ ...prev, cover_image_url: event.target.value }))}
                className="rounded-xl border border-surface-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  placeholder="Cidade"
                  value={form.city}
                  onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
                  className="rounded-xl border border-surface-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
                <input
                  placeholder="Estado"
                  value={form.state}
                  onChange={(event) => setForm((prev) => ({ ...prev, state: event.target.value }))}
                  className="rounded-xl border border-surface-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="mt-2 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/70"
              >
                {isSaving ? "Salvando..." : "Cadastrar imóvel"}
              </button>
            </form>
          </div>
        </section>

        <section className="rounded-3xl border border-surface-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-surface-900">Leads recentes</h2>
            <p className="text-sm text-surface-500">{leads.length} registro(s)</p>
          </div>
          <div className="mt-4 space-y-4">
            {isLoading ? (
              <p className="text-sm text-surface-500">Carregando...</p>
            ) : leads.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-surface-200 p-6 text-center text-sm text-surface-500">
                Nenhum lead capturado ainda.
              </p>
            ) : (
              leads.map((lead) => (
                <div key={lead.id} className="rounded-2xl border border-surface-200 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-surface-900">{lead.name}</p>
                      <p className="text-sm text-surface-500">{lead.email ?? lead.phone ?? "Contato não informado"}</p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                      Score {lead.score ?? "--"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-surface-600">{lead.message ?? "Sem mensagem adicional."}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-surface-500">
                    {lead.recommended_properties.slice(0, 2).map((recommendation) => (
                      <span key={recommendation.property.id} className="rounded-full bg-surface-100 px-3 py-1">
                        {recommendation.property.title}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
