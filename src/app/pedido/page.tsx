import type { Metadata } from "next";
import { AssistentePedido } from "@/components/pedido/AssistentePedido";
import { TituloSecao } from "@/components/ui/TituloSecao";
import { mensagemPadrao } from "@/lib/mensagens";
import { buscarPeca } from "@/lib/pecas";
import { linkWhatsApp } from "@/lib/site";

export const metadata: Metadata = {
  title: "Monte o seu pedido",
  description: "Conte a sua ideia em poucos passos e abra a conversa no WhatsApp já com tudo escrito.",
};

export default async function Pedido({ searchParams }: PageProps<"/pedido">) {
  const { peca } = await searchParams;
  // Slug inexistente ou inválido é ignorado: o assistente abre normalmente, sem modelo de referência.
  const modelo = typeof peca === "string" ? await buscarPeca(peca) : null;

  return (
    <div className="mx-auto max-w-2xl px-5 py-14 md:py-20">
      <TituloSecao sobretitulo="Encomenda" titulo="Monte o seu pedido" />
      <p className="mx-auto mt-6 max-w-md text-center text-lg leading-relaxed text-grafite/80">
        Conte a sua ideia em poucos passos. No fim, abrimos o WhatsApp com tudo já escrito.
      </p>

      <noscript>
        <p className="mt-10 border border-champagne p-4 text-center text-grafite/80">
          Para montar o pedido aqui é preciso ativar o JavaScript. Se preferir,{" "}
          <a href={linkWhatsApp(mensagemPadrao("contato"))} className="text-ouro-escuro underline underline-offset-4">
            fale direto no WhatsApp
          </a>
          .
        </p>
      </noscript>

      <AssistentePedido modeloReferencia={modelo?.nome} />
    </div>
  );
}
