import type { Metadata } from "next";
import Link from "next/link";
import { CartaoPeca } from "@/components/galeria/CartaoPeca";
import { TituloSecao } from "@/components/ui/TituloSecao";
import { categoriasComPecas, listarPecas } from "@/lib/pecas";

export const metadata: Metadata = {
  title: "Galeria",
  description: "Conheça os vestidos e as peças sob medida já confeccionados pelo ateliê Miss Style.",
};

export default async function Galeria({ searchParams }: PageProps<"/galeria">) {
  const { categoria } = await searchParams;
  const categorias = await categoriasComPecas();
  const ativa = typeof categoria === "string" && categorias.some((c) => c.slug === categoria) ? categoria : undefined;
  const pecas = await listarPecas({ categoria: ativa });

  const chip = (ativo: boolean) =>
    `whitespace-nowrap rounded-full border px-5 py-2 text-xs tracking-[0.16em] uppercase transition-colors ${
      ativo ? "border-ouro-escuro bg-ouro-escuro text-marfim" : "border-champagne text-grafite hover:border-ouro"
    }`;

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 md:py-20">
      <TituloSecao sobretitulo="Galeria" titulo="Peças feitas com carinho" />

      <nav aria-label="Filtrar por categoria" className="-mx-5 mt-10 overflow-x-auto px-5 pb-2">
        <ul className="flex gap-2 md:flex-wrap md:justify-center">
          <li>
            <Link href="/galeria" scroll={false} className={chip(!ativa)} aria-current={!ativa ? "true" : undefined}>
              Todas
            </Link>
          </li>
          {categorias.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/galeria?categoria=${c.slug}`}
                scroll={false}
                className={chip(ativa === c.slug)}
                aria-current={ativa === c.slug ? "true" : undefined}
              >
                {c.rotulo}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {pecas.length === 0 ? (
        <p className="mt-16 text-center text-grafite/70">
          Ainda não há peças nesta categoria. Em breve teremos novidades por aqui.
        </p>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
          {pecas.map((p, i) => (
            <CartaoPeca key={p.slug} peca={p} prioridade={i < 4} />
          ))}
        </div>
      )}
    </div>
  );
}
