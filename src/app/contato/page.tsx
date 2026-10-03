import type { Metadata } from "next";
import { FormularioContato } from "@/components/contato/FormularioContato";
import { LinkWhatsApp } from "@/components/ui/LinkWhatsApp";
import { TituloSecao } from "@/components/ui/TituloSecao";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contato",
  description: `Faça a sua encomenda pelo WhatsApp ou pelo Instagram. Ateliê ${site.nome}, ${site.cidade}.`,
};

export default function Contato() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-14 md:py-20">
      <TituloSecao sobretitulo="Contato" titulo="Faça já a sua encomenda" />

      <div className="mt-14 grid gap-14 md:grid-cols-[1fr_1.2fr]">
        <div className="space-y-8">
          <div>
            <h3 className="text-xs tracking-[0.25em] text-ouro-escuro uppercase">WhatsApp</h3>
            <LinkWhatsApp origem="contato" className="mt-2 block font-serif text-3xl text-grafite hover:text-ouro-escuro">
              {site.whatsappExibicao}
            </LinkWhatsApp>
          </div>
          <div>
            <h3 className="text-xs tracking-[0.25em] text-ouro-escuro uppercase">Instagram</h3>
            <a
              href={site.instagram.url}
              target="_blank"
              rel="noopener"
              className="mt-2 block font-serif text-3xl text-grafite hover:text-ouro-escuro"
            >
              @{site.instagram.usuario}
            </a>
            <p className="mt-1 text-sm text-grafite/70">Encomendas também pelo direct.</p>
          </div>
          <div>
            <h3 className="text-xs tracking-[0.25em] text-ouro-escuro uppercase">Onde estamos</h3>
            <p className="mt-2 font-serif text-3xl text-grafite">{site.cidade}</p>
          </div>
        </div>

        <div className="border border-champagne bg-champagne/15 p-6 md:p-8">
          <h2 className="font-serif text-3xl text-grafite">Conte a sua ideia</h2>
          <p className="mt-2 mb-7 text-grafite/70">Ao enviar, abrimos o WhatsApp com a sua mensagem pronta.</p>
          <FormularioContato />
        </div>
      </div>
    </div>
  );
}
