import { useState } from "react";

import Head from "next/head";
import { useRouter } from "next/router";

import { api } from "@/lib/api";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@imobconvex.com");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const response = await api.login(email, password);
      localStorage.setItem("imobconvex_token", response.access_token);
      localStorage.setItem("imobconvex_token_expiration", response.expires_at);
      router.replace("/admin");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Falha ao autenticar");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-100 px-6">
      <Head>
        <title>Login administrativo · ImobConvex</title>
      </Head>
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-surface-200 bg-white p-8 shadow-xl">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-surface-900">Acesse o painel</h1>
          <p className="text-sm text-surface-500">Use as credenciais fornecidas para acessar o painel administrativo.</p>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm font-medium text-surface-700">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-xl border border-surface-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="password" className="text-sm font-medium text-surface-700">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-xl border border-surface-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/70"
          >
            {status === "loading" ? "Entrando..." : "Entrar"}
          </button>
          {status === "error" && error && <p className="text-sm text-red-500">{error}</p>}
        </form>
        <p className="text-center text-xs text-surface-400">
          O usuário administrador inicial é configurado via variáveis de ambiente do backend.
        </p>
      </div>
    </div>
  );
}
