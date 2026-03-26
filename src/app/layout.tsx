import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { ThemeProvider } from "@/lib/theme";

export const metadata: Metadata = {
  title: "SmartHome — Умный дом",
  description: "Панель управления умным домом с мониторингом датчиков ESP",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="antialiased font-sans">
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
