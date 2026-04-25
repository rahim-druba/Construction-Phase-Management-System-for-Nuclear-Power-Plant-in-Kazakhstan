import "@/styles/globals.css";
import Head from "next/head";
import { LangProvider } from "@/utils/i18n";
import AppShell from "@/components/AppShell";

export default function App({ Component, pageProps }) {
  return (
    <LangProvider>
      <Head>
        <title>Atomforce — Workforce Command System</title>
        <meta
          name="description"
          content="Workforce Command System for Nuclear Power Plant Construction"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <AppShell>
        <Component {...pageProps} />
      </AppShell>
    </LangProvider>
  );
}
