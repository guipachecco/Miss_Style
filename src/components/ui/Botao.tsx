import Link from "next/link";
import type { ComponentProps } from "react";

const base =
  "inline-flex items-center justify-center rounded-full px-7 py-3 text-sm tracking-[0.14em] uppercase transition-colors";
const estilos = {
  primario: "bg-ouro-escuro text-marfim hover:bg-grafite",
  contorno: "border border-ouro text-grafite hover:border-grafite hover:bg-champagne/40",
} as const;

type Props = ComponentProps<typeof Link> & { variante?: keyof typeof estilos };

export function Botao({ variante = "primario", className = "", ...props }: Props) {
  return <Link {...props} className={`${base} ${estilos[variante]} ${className}`} />;
}
