import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { SessionProvider } from "@/components/shared/session-provider";
import "./globals.css";

// Served by the site itself: next/font downloads the file at build time.
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });

export const metadata: Metadata = {
  title: "Glow – Estética Automotiva",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={nunito.variable}>
      <body>
        {/* RNF005: the first stop of the keyboard skips the navigation. */}
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:font-semibold focus:shadow-neu-md"
        >
          Pular para o conteúdo
        </a>
        {/* Base UI: popups in portals always stay above the page. */}
        <div className="isolate">
          <SessionProvider>{children}</SessionProvider>
        </div>
      </body>
    </html>
  );
}
