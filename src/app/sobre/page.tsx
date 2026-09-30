import type { Metadata } from "next";
import Image from "next/image";
import { Botao } from "@/components/ui/Botao";
import { TituloSecao } from "@/components/ui/TituloSecao";
import { Versiculo } from "@/components/ui/Versiculo";
import { passos, site, versiculos } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sobre o ateliê",
  description: `Conheça o ateliê ${site.nome}, em ${site.cidade}: roupas feitas sob medida, com cuidado e carinho.`,
};

// TODO(dona do ateliê): trocar por a história real (quem começou, quando, o que inspira o trabalho)
// e adicionar fotos do espaço e do processo.
export default function Sobre() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-14 md:py-20">
      <TituloSecao sobretitulo="Sobre o ateliê" titulo="Feito para você, do seu jeito" />

      <div className="mt-12 flex justify-center">
        <Image
          src="/marca/logo.png"
          alt="Logo do ateliê Miss Style: lírio, abelha e laço"
          width={700}
          height={700}
          className="h-56 w-56"
        />
      </div>

      <div className="mx-auto mt-8 max-w-2xl space-y-5 text-center text-lg leading-relaxed text-grafite/85">
        <p>
          A {site.nome} é um ateliê de roupas em {site.cidade}. Trabalhamos com peças sob medida, do jeitinho que você
          imagina e da maneira que você escolher.
        </p>
        <p>
          Atendemos com todo o cuidado e carinho. Você pode chegar com um desenho, uma foto, um modelo da internet ou até
          mesmo uma ideia na cabeça: nós cuidamos do resto.
        </p>
      </div>

      <div className="my-16 border-y border-champagne py-12">
        <Versiculo texto={versiculos.maos.texto} referencia={versiculos.maos.ref} />
      </div>

      <TituloSecao sobretitulo="Nosso processo" titulo="Como uma peça nasce" />
      <ol className="mt-12 grid gap-8 sm:grid-cols-2">
        {passos.map((p, i) => (
          <li key={p.titulo} className="flex gap-5 border-t border-ouro/50 pt-5">
            <span className="font-script text-5xl leading-none text-ouro">{i + 1}</span>
            <div>
              <h3 className="font-serif text-2xl text-grafite">{p.titulo}</h3>
              <p className="mt-1 leading-relaxed text-grafite/75">{p.texto}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-16 text-center">
        <Botao href="/contato">Vamos conversar</Botao>
      </div>
    </div>
  );
}
