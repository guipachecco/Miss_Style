"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Header } from "./Header";
import { WhatsAppFlutuante } from "./WhatsAppFlutuante";

// Cabeçalho, rodapé e botão de WhatsApp envolvem o site, mas não o painel /studio.
export function Chrome({ children, rodape }: { children: ReactNode; rodape: ReactNode }) {
  const emPainel = usePathname().startsWith("/studio");
  if (emPainel) return <>{children}</>;

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      {rodape}
      <WhatsAppFlutuante />
    </>
  );
}
