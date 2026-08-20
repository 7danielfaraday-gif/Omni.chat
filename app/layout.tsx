import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Amanda Bergamasco | Massoterapia",
  description: "Massoterapia personalizada, liberação miofascial e experiências de cuidado.",
  icons: {
    icon: "/assets/logo-original.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
