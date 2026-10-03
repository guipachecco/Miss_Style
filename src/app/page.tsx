import Image from "next/image";
import { CartaoPeca } from "@/components/galeria/CartaoPeca";
import { Botao, classesBotao } from "@/components/ui/Botao";
import { LinkWhatsApp } from "@/components/ui/LinkWhatsApp";
import { TituloSecao } from "@/components/ui/TituloSecao";
import { Versiculo } from "@/components/ui/Versiculo";
import { listarPecas } from "@/lib/pecas";
import { passos, servicos, site, versiculos } from "@/lib/site";

export default async function Home() {
  const destaques = (await listarPecas({ destaque: true })).slice(0, 4);
  const heroFoto = destaques.find((p) => p.fotos[0])?.fotos[0];

  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pt-10 pb-16 md:grid-cols-2 md:gap-16 md:pt-16 md:pb-24">
        <div className="entrada text-center md:text-left">
          <p className="text-xs tracking-[0.3em] text-ouro-escuro uppercase">{site.subtitulo} · {site.cidade}</p>
          <h1 className="mt-5 font-serif text-5xl leading-[1.05] text-grafite sm:text-6xl lg:text-7xl">
            Você sonha,
            <span className="mt-1 block font-script text-6xl text-ouro-escuro sm:text-7xl lg:text-8xl">a gente faz</span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-grafite/80 md:mx-0">{site.frase}</p>
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center md:justify-start">
            <LinkWhatsApp origem="home_hero" className={classesBotao("primario")}>
              Falar no WhatsApp
            </LinkWhatsApp>
            <Botao href="/galeria" variante="contorno">
              Ver modelos
            </Botao>
          </div>
        </div>

        <div className="entrada mx-auto w-full max-w-sm md:max-w-md" style={{ animationDelay: "0.15s" }}>
          <div className="relative aspect-[3/4] overflow-hidden rounded-t-full border border-ouro/60 bg-champagne/40 p-2">
            <div className="relative h-full w-full overflow-hidden rounded-t-full">
              {heroFoto ? (
                <Image
                  src={heroFoto.src}
                  alt={heroFoto.alt}
                  fill
                  priority
                  sizes="(min-width: 768px) 448px, 90vw"
                  className="object-cover object-center"
                />
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-champagne/25 px-5 py-16 md:py-24">
        <div className="mx-auto max-w-2xl">
          <Versiculo texto={versiculos.lirios.texto} referencia={versiculos.lirios.ref} />
          <p className="mt-8 text-center text-lg leading-relaxed text-grafite/80">
            Cada peça nasce de uma conversa. Ouvimos a sua ideia, tomamos as suas medidas e cuidamos de cada detalhe até o
            dia em que você a veste.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <TituloSecao sobretitulo="Nosso trabalho" titulo="Modelos em destaque" />
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
          {destaques.map((p, i) => (
            <CartaoPeca key={p.slug} peca={p} prioridade={i < 2} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Botao href="/galeria" variante="contorno">
            Ver toda a galeria
          </Botao>
        </div>
      </section>

      <section className="border-y border-champagne bg-marfim px-5 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <TituloSecao sobretitulo="Como funciona" titulo="Do sonho à sua peça" />
          <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {passos.map((p, i) => (
              <li key={p.titulo} className="text-center">
                <span className="font-script text-6xl text-ouro">{i + 1}</span>
                <h3 className="mt-1 font-serif text-3xl text-grafite">{p.titulo}</h3>
                <p className="mx-auto mt-3 max-w-[16rem] leading-relaxed text-grafite/75">{p.texto}</p>
              </li>
            ))}
          </ol>
          <p className="mt-14 text-center font-serif text-2xl text-ouro-escuro italic">
            Traga o seu modelo, a foto e nós cuidamos do resto.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <TituloSecao sobretitulo="Serviços" titulo="O que fazemos por você" />
        <ul className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {servicos.slice(0, 3).map((s) => (
            <li key={s.titulo} className="border-t border-ouro/50 pt-5">
              <h3 className="font-serif text-2xl text-grafite">{s.titulo}</h3>
              <p className="mt-2 leading-relaxed text-grafite/75">{s.texto}</p>
            </li>
          ))}
        </ul>
        <div className="mt-10 text-center">
          <Botao href="/servicos" variante="contorno">
            Todos os serviços
          </Botao>
        </div>
      </section>

      <section className="bg-grafite px-5 py-20 text-center text-marfim md:py-24">
        <p className="font-script text-5xl text-champagne md:text-6xl">Será um prazer atender você</p>
        <p className="mx-auto mt-4 max-w-md text-marfim/80">
          Conte a sua ideia pelo WhatsApp ou pelo Instagram e vamos transformá-la em uma peça única.
        </p>
        <div className="mt-8">
          <LinkWhatsApp origem="home_final" className={classesBotao("primario", "bg-champagne !text-grafite hover:bg-marfim")}>
            Fazer minha encomenda
          </LinkWhatsApp>
        </div>
      </section>
    </>
  );
}
