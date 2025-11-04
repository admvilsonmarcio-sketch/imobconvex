import type { AppProps } from "next/app";
import Head from "next/head";
import "../styles/globals.css";

export default function ImobConvexApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>ImobConvex — Plataforma Imobiliária Inteligente</title>
        <meta
          name="description"
          content="Portal imobiliário premium com CRM inteligente, automações e IA integrada."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
