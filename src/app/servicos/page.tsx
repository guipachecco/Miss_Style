import type { Metadata } from "next";
import { classesBotao } from "@/components/ui/Botao";
import { LinkWhatsApp } from "@/components/ui/LinkWhatsApp";
import { TituloSecao } from "@/components/ui/TituloSecao";
import { servicos } from "@/lib/site";

export const metadata: Metadata = {
  title: "Serviços",
  description: "Confecção sob medida, modelos exclusivos, personalização, ajustes e consultoria para escolha do modelo.",
};

export default function Servicos() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-14 md:py-20">
      <TituloSecao sobretitulo="Serviços" titulo="O que fazemos por você" />
      <p className="mx-auto mt-6 max-w-xl text-center text-lg leading-relaxed text-grafite/80">
        Traga o seu modelo, a foto e nós cuidamos do resto.
      </p>

      <ul className="mt-14 grid gap-x-12 gap-y-10 sm:grid-cols-2">
        {servicos.map((s) => (
          <li key={s.titulo} className="border-t border-ouro/50 pt-5">
            <h3 className="font-serif text-3xl text-grafite">{s.titulo}</h3>
            <p className="mt-2 leading-relaxed text-grafite/75">{s.texto}</p>
          </li>
        ))}
      </ul>

      <div className="mt-16 text-center">
        <LinkWhatsApp origem="servicos" className={classesBotao("primario")}>
          Pedir um orçamento
        </LinkWhatsApp>
      </div>
    </div>
  );
}
