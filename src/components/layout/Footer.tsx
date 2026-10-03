import Link from "next/link";
import { LinkWhatsApp } from "@/components/ui/LinkWhatsApp";
import { navegacao, site, versiculos } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-champagne bg-champagne/25">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <blockquote className="mx-auto max-w-xl text-center">
          <p className="font-serif text-2xl leading-snug text-grafite italic md:text-3xl">
            “{versiculos.vestidos.texto}”
          </p>
          <p className="mt-3 text-xs tracking-[0.2em] text-ouro-escuro uppercase">{versiculos.vestidos.ref}</p>
        </blockquote>

        <div className="mt-14 grid gap-10 border-t border-champagne pt-10 text-sm md:grid-cols-3">
          <div>
            <p className="font-script text-4xl text-ouro-escuro">{site.nome}</p>
            <p className="mt-1 text-xs tracking-[0.2em] text-dourado-logo uppercase">{site.subtitulo}</p>
            <p className="mt-4 max-w-xs leading-relaxed text-grafite/80">{site.frase}</p>
          </div>
          <div>
            <p className="mb-3 text-xs tracking-[0.2em] text-dourado-logo uppercase">Navegue</p>
            <ul className="space-y-2">
              {navegacao.map((i) => (
                <li key={i.href}>
                  <Link href={i.href} className="hover:text-ouro-escuro">
                    {i.rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs tracking-[0.2em] text-dourado-logo uppercase">Fale com a gente</p>
            <ul className="space-y-2">
              <li>
                <LinkWhatsApp origem="rodape" className="hover:text-ouro-escuro">
                  WhatsApp {site.whatsappExibicao}
                </LinkWhatsApp>
              </li>
              <li>
                <a href={site.instagram.url} className="hover:text-ouro-escuro" rel="noopener">
                  Instagram @{site.instagram.usuario}
                </a>
              </li>
              <li className="text-grafite/80">{site.cidade}</li>
            </ul>
          </div>
        </div>

        <p className="mt-12 text-center text-xs text-grafite/60">
          © {new Date().getFullYear()} {site.nome} {site.subtitulo}. Todos os direitos reservados. ·{" "}
          <Link href="/privacidade" className="underline underline-offset-4 hover:text-ouro-escuro">
            Política de privacidade
          </Link>
        </p>
      </div>
    </footer>
  );
}
