import Link from "next/link";

import type { Property } from "@/types";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function PropertyCard({ property }: { property: Property }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-surface-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-56 w-full overflow-hidden bg-surface-200">
        {property.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={property.cover_image_url}
            alt={property.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-surface-400">
            Sem imagem disponível
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div>
          <div className="text-sm font-medium uppercase tracking-wide text-primary">
            {property.operation === "sale" ? "À venda" : "Para alugar"}
          </div>
          <h3 className="mt-1 text-xl font-semibold text-surface-900">{property.title}</h3>
          <p className="mt-1 text-sm text-surface-500">
            {property.city} · {property.state}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-surface-600">
          {property.bedrooms !== null && property.bedrooms !== undefined && (
            <span>{property.bedrooms} quartos</span>
          )}
          {property.bathrooms !== null && property.bathrooms !== undefined && (
            <span>{property.bathrooms} banheiros</span>
          )}
          {property.area && <span>{property.area} m²</span>}
          <span className="rounded-full bg-surface-100 px-3 py-1 font-semibold text-primary">
            {formatCurrency(property.price)}
          </span>
        </div>
        <p className="line-clamp-2 text-sm text-surface-500">{property.description}</p>
        <Link
          href={`/properties/${property.slug}`}
          className="mt-auto inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
        >
          Ver detalhes
        </Link>
      </div>
    </article>
  );
}
