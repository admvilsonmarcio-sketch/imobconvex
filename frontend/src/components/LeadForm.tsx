import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import type { LeadPayload, LeadResponse } from "@/types";

const baseState: LeadPayload = {
  name: "",
  email: "",
  phone: "",
  message: "",
  preferences: {
    operation: "buy",
    bedrooms: undefined,
    budget_max: undefined,
    locations: []
  }
};

type LeadFormProps = {
  propertyId?: number;
  defaultCity?: string;
};

export function LeadForm({ propertyId, defaultCity }: LeadFormProps) {
  const [form, setForm] = useState<LeadPayload>({
    ...baseState,
    property_id: propertyId,
    preferences: {
      ...baseState.preferences,
      locations: defaultCity ? [defaultCity] : []
    }
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [insights, setInsights] = useState<LeadResponse["lead"] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        locations: defaultCity ? [defaultCity] : prev.preferences?.locations ?? []
      }
    }));
  }, [defaultCity]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      const payload: LeadPayload = {
        ...form,
        preferences: {
          ...form.preferences,
          locations:
            form.preferences?.locations?.length || !defaultCity
              ? form.preferences?.locations
              : [defaultCity]
        }
      };
      const response = await api.submitLead(payload);
      setInsights(response.lead);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Erro ao enviar lead");
    }
  }

  return (
    <div className="rounded-3xl border border-surface-200 bg-white p-8 shadow-lg">
      <h2 className="text-2xl font-semibold text-surface-900">Converse com um especialista</h2>
      <p className="mt-2 text-sm text-surface-500">Informe seus dados e receba recomendações inteligentes em segundos.</p>
      <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-surface-700" htmlFor="lead-name">
            Nome
          </label>
          <input
            id="lead-name"
            name="name"
            required
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            className="rounded-xl border border-surface-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Como devemos te chamar?"
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-surface-700" htmlFor="lead-email">
              E-mail
            </label>
            <input
              id="lead-email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              className="rounded-xl border border-surface-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="seu@email.com"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-surface-700" htmlFor="lead-phone">
              Telefone
            </label>
            <input
              id="lead-phone"
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              className="rounded-xl border border-surface-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="(11) 99999-0000"
            />
          </div>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-surface-700" htmlFor="lead-message">
            Mensagem
          </label>
          <textarea
            id="lead-message"
            rows={3}
            value={form.message}
            onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
            className="rounded-xl border border-surface-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Conte-nos mais sobre o imóvel ideal."
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-surface-700" htmlFor="lead-operation">
              Objetivo
            </label>
            <select
              id="lead-operation"
              value={form.preferences?.operation ?? "buy"}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  preferences: {
                    ...prev.preferences,
                    operation: event.target.value as "buy" | "rent"
                  }
                }))
              }
              className="rounded-xl border border-surface-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="buy">Comprar</option>
              <option value="rent">Alugar</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-surface-700" htmlFor="lead-budget">
              Orçamento máximo (R$)
            </label>
            <input
              id="lead-budget"
              type="number"
              value={form.preferences?.budget_max ?? ""}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  preferences: {
                    ...prev.preferences,
                    budget_max: event.target.value ? Number(event.target.value) : undefined
                  }
                }))
              }
              className="rounded-xl border border-surface-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-surface-700" htmlFor="lead-bedrooms">
              Quartos
            </label>
            <input
              id="lead-bedrooms"
              type="number"
              value={form.preferences?.bedrooms ?? ""}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  preferences: {
                    ...prev.preferences,
                    bedrooms: event.target.value ? Number(event.target.value) : undefined
                  }
                }))
              }
              className="rounded-xl border border-surface-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/70"
        >
          {status === "loading" ? "Enviando..." : "Receber recomendações"}
        </button>
        {status === "error" && error && <p className="text-sm text-red-500">{error}</p>}
      </form>

      {status === "success" && insights && (
        <div className="mt-6 space-y-4 rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <div>
            <h3 className="text-lg font-semibold text-primary">Lead qualificado!</h3>
            <p className="text-sm text-surface-600">
              Score: <strong>{insights.score ?? "--"}</strong> · Probabilidade de fechamento: <strong>{Math.round((insights.probability_to_close ?? 0) * 100)}%</strong>
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-surface-700">Próximas ações sugeridas</p>
            <ul className="mt-2 space-y-2 text-sm text-surface-600">
              {insights.next_best_actions.map((action) => (
                <li key={action.label} className="rounded-xl bg-white/70 px-3 py-2">
                  {action.label} — <span className="uppercase text-primary">{action.channel}</span>
                </li>
              ))}
            </ul>
          </div>
          {insights.recommended_properties.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-surface-700">Imóveis recomendados</p>
              <ul className="mt-2 space-y-1 text-sm text-surface-600">
                {insights.recommended_properties.map((recommendation) => (
                  <li key={recommendation.property.id}>
                    {recommendation.property.title} — Match {Math.round(recommendation.match_score * 100)}%
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
