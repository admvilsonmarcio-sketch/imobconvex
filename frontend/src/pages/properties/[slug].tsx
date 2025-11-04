import Head from "next/head";
import type { GetServerSideProps } from "next";

import { LeadForm } from "@/components/LeadForm";
import type { Property } from "@/types";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface PropertyPageProps {
  property: Property;
}

export default function PropertyPage({ property }: PropertyPageProps) {
  return (
    <div className="min-h-screen bg-surface-100">
      <Head>
        <title>{property.title} · ImobConvex</title>
      </Head>
      <header className="bg-surface-900 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-16 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.2em]">
              {property.operation === "sale" ? "À venda" : "Para alugar"}
            </span>
            <h1 className="text-4xl font-semibold md:text-5xl">{property.title}</h1>
            <p className="text-sm uppercase tracking-widest text-white/70">
              {property.city} · {property.state} · {property.country}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm uppercase tracking-widest text-white/60">Investimento</p>
            <p className="text-3xl font-semibold">{formatCurrency(property.price)}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-16 px-6 py-16">
        <section className="grid gap-6 md:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            {property.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={property.cover_image_url}
                alt={property.title}
                className="h-96 w-full rounded-3xl object-cover"
              />
            ) : (
              <div className="flex h-96 w-full items-center justify-center rounded-3xl bg-surface-200 text-surface-500">
                Imagem não disponível
              </div>
            )}
            {property.gallery.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-3">
                {property.gallery.map((url) => (
                  <div key={url} className="overflow-hidden rounded-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="Galeria do imóvel" className="h-32 w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-3xl border border-surface-200 bg-white p-8 shadow-lg">
            <h2 className="text-xl font-semibold text-surface-900">Informações rápidas</h2>
            <dl className="mt-4 grid gap-3 text-sm text-surface-600">
              <div className="flex items-center justify-between rounded-2xl bg-surface-100 px-4 py-3">
                <dt>Quartos</dt>
                <dd>{property.bedrooms ?? "-"}</dd>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-surface-100 px-4 py-3">
                <dt>Banheiros</dt>
                <dd>{property.bathrooms ?? "-"}</dd>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-surface-100 px-4 py-3">
                <dt>Vagas</dt>
                <dd>{property.parking_spaces ?? "-"}</dd>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-surface-100 px-4 py-3">
                <dt>Área</dt>
                <dd>{property.area ? `${property.area} m²` : "-"}</dd>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-surface-100 px-4 py-3">
                <dt>Status</dt>
                <dd className="font-semibold uppercase text-primary">{property.status}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-surface-900">Descrição</h2>
            <p className="leading-relaxed text-surface-600">{property.description}</p>
            {property.amenities.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-surface-800">Diferenciais</h3>
                <ul className="mt-3 flex flex-wrap gap-3">
                  {property.amenities.map((item) => (
                    <li key={item} className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-surface-800">Endereço</h3>
              <p className="mt-2 text-sm text-surface-600">
                {property.address_line}, {property.city} - {property.state}
              </p>
            </div>
          </div>
          <LeadForm propertyId={property.id} defaultCity={property.city} />
        </section>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<PropertyPageProps> = async ({ params }) => {
  const slug = params?.slug as string;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

  const response = await fetch(`${baseUrl}/properties/${slug}`);
  if (!response.ok) {
    return { notFound: true };
  }

  const property = await response.json();

  return {
    props: {
      property
    }
  };
};
