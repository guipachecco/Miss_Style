import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FotoPeca } from "@/components/galeria/CartaoPeca";
import { Botao } from "@/components/ui/Botao";
import { LinkWhatsApp } from "@/components/ui/LinkWhatsApp";
import { mensagemPadrao } from "@/lib/mensagens";
import { buscarPeca, listarPecas, rotuloCategoria } from "@/lib/pecas";

export async function generateStaticParams() {
  return (await listarPecas()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/galeria/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const peca = await buscarPeca(slug);
  if (!peca) return {};
  return {
    title: peca.nome,
    description: peca.resumo,
    openGraph: peca.fotos[0] ? { images: [peca.fotos[0].src] } : undefined,
  };
}

export default async function PaginaPeca({ params }: PageProps<"/galeria/[slug]">) {
  const { slug } = await params;
  const peca = await buscarPeca(slug);
  if (!peca) notFound();

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:py-16">
      <Link href="/galeria" className="text-xs tracking-[0.2em] text-ouro-escuro uppercase hover:text-grafite">
        ← Voltar para a galeria
      </Link>

      <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-16">
        <div className="space-y-4">
          <div className="relative aspect-[3/4] overflow-hidden bg-champagne/30">
            <FotoPeca peca={peca} prioridade sizes="(min-width: 768px) 50vw, 100vw" />
          </div>
          {peca.fotos.length > 1 && (
            <ul className="grid grid-cols-4 gap-3">
              {peca.fotos.slice(1).map((f) => (
                <li key={f.src} className="relative aspect-[3/4] overflow-hidden bg-champagne/30">
                  <Image src={f.src} alt={f.alt} fill sizes="12vw" className="object-cover" />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="md:pt-6">
          <p className="text-xs tracking-[0.25em] text-ouro-escuro uppercase">{rotuloCategoria(peca.categoria)}</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-grafite md:text-5xl">{peca.nome}</h1>
          <span aria-hidden="true" className="mt-5 block h-px w-14 bg-ouro" />
          <p className="mt-6 text-lg leading-relaxed text-grafite/80">{peca.resumo}</p>

          <ul className="mt-8 space-y-3 border-t border-champagne pt-6">
            {peca.detalhes.map((d) => (
              <li key={d} className="flex gap-3 text-grafite/85">
                <span aria-hidden="true" className="mt-2.5 h-px w-4 shrink-0 bg-ouro" />
                {d}
              </li>
            ))}
            <li className="flex gap-3 text-grafite/85">
              <span aria-hidden="true" className="mt-2.5 h-px w-4 shrink-0 bg-ouro" />
              {peca.tipo === "pronta" ? (peca.disponivel ? "Peça pronta, disponível" : "Peça pronta, já vendida") : "Feita sob medida para você"}
            </li>
          </ul>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Botao href={`/pedido?peca=${encodeURIComponent(peca.slug)}`}>Quero um modelo assim</Botao>
            <Botao href="/contato" variante="contorno">
              Outras formas de contato
            </Botao>
          </div>
          <p className="mt-4 text-sm text-grafite/70">
            <LinkWhatsApp
              origem="peca"
              mensagem={mensagemPadrao("peca", { pecaNome: peca.nome })}
              className="inline-block py-2 underline underline-offset-4 hover:text-ouro-escuro"
            >
              Prefiro falar direto no WhatsApp
            </LinkWhatsApp>
          </p>
          <p className="mt-4 text-sm text-grafite/60">
            Cada peça é feita nas suas medidas. Detalhes como tecido e cor podem ser personalizados.
          </p>
        </div>
      </div>
    </div>
  );
}
