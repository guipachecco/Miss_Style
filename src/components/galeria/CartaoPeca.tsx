import Image from "next/image";
import Link from "next/link";
import { rotuloCategoria, type Peca } from "@/lib/pecas";

export function FotoPeca({ peca, sizes, prioridade }: { peca: Peca; sizes: string; prioridade?: boolean }) {
  const foto = peca.fotos[0];
  if (!foto) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-champagne/40 text-dourado-logo">
        <span className="font-script text-4xl">Miss Style</span>
        <span className="text-xs tracking-[0.2em] uppercase">Foto em breve</span>
      </div>
    );
  }
  return (
    <Image
      src={foto.src}
      alt={foto.alt}
      fill
      sizes={sizes}
      priority={prioridade}
      className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
    />
  );
}

export function CartaoPeca({ peca, prioridade }: { peca: Peca; prioridade?: boolean }) {
  return (
    <Link href={`/galeria/${peca.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-champagne/30">
        <FotoPeca peca={peca} prioridade={prioridade} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" />
      </div>
      <div className="mt-4">
        <p className="text-[11px] tracking-[0.22em] text-ouro-escuro uppercase">{rotuloCategoria(peca.categoria)}</p>
        <h3 className="mt-1 font-serif text-2xl leading-tight text-grafite">{peca.nome}</h3>
        {peca.tipo === "pronta" && (
          <p className="mt-1 text-xs tracking-wide text-ouro-escuro">{peca.disponivel ? "Pronta entrega" : "Vendida"}</p>
        )}
      </div>
    </Link>
  );
}
