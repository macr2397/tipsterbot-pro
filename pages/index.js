import Head from "next/head";
import TipsterBot from "../components/TipsterBot";

export default function Home() {
  return (
    <>
      <Head>
        <title>TipsterBot Pro</title>
        <meta name="description" content="Análisis profesional de apuestas con datos reales de API-Football e IA" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      <TipsterBot />
    </>
  );
}
