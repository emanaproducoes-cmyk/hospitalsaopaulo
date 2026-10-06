import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Proposta HMSP — Marketing, Branding e Growth",
  description: "Uma leitura executiva do plano de marketing, branding e growth do Hospital e Maternidade São Paulo.",
  icons: { icon: "/assets/logo-mark-transparent.png" }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
