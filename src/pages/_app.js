import "@/styles/globals.css";
import Head from "next/head";
import { LangProvider } from "@/utils/i18n";
import AppShell from "@/components/AppShell";

export default function App({ Component, pageProps }) {
  return (
    <LangProvider>
      <Head>
        <title>Atomforce — NPP Workforce Intelligence</title>
        <meta
          name="description"
          content="Workforce Intelligence Dashboard for Nuclear Power Plant Construction"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </Head>
      <AppShell>
        <Component {...pageProps} />
      </AppShell>
    </LangProvider>
  );
}
