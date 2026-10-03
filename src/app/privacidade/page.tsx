import type { Metadata } from "next";
import { TituloSecao } from "@/components/ui/TituloSecao";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description: `Como o site do ateliê ${site.nome} trata os seus dados: o que é medido, o que fica no seu navegador e o que vai para o WhatsApp.`,
};

// Texto escrito com base no que o site faz hoje (medição com Umami, assistente de pedido e formulário
// que abrem o WhatsApp). Revisar com um profissional (LGPD) antes de divulgar o site, e atualizar
// sempre que o site passar a coletar algo novo (por exemplo, o provador virtual).
const secoes = [
  {
    titulo: "Quem cuida do site",
    texto: [
      `O site é do ateliê ${site.nome}, em ${site.cidade}. Para falar sobre os seus dados, chame o ateliê pelo WhatsApp ${site.whatsappExibicao} ou pelo Instagram @${site.instagram.usuario}.`,
    ],
  },
  {
    titulo: "O que o site mede",
    texto: [
      "Usamos o Umami, uma ferramenta de medição que não usa cookies. Ela registra quais páginas são visitadas, de onde a pessoa veio, o navegador, o sistema e o tipo de aparelho, e o país.",
      "Também contamos três ações: quando alguém clica em um botão de WhatsApp (e qual botão), em que passo do assistente de pedido a pessoa está e quando ela envia o pedido. Essas contagens servem para entender o que ajuda as clientes e melhorar o site.",
      "Respeitamos a opção “Não rastrear” do seu navegador. Os dados da medição ficam em servidores da Umami, que podem estar fora do Brasil.",
    ],
  },
  {
    titulo: "O assistente de pedido e o formulário de contato",
    texto: [
      "Tudo o que você escreve no assistente de pedido (nome, data, tipo de peça, tecido, cor e detalhes) fica somente no seu navegador, na aba aberta, para você não perder o que já preencheu. Isso é apagado quando você envia o pedido.",
      "Ao clicar em enviar, abrimos o WhatsApp com a sua mensagem pronta e você decide se envia. A mensagem só chega ao ateliê se você a enviar. O mesmo vale para o formulário da página de contato.",
      "Nada do que você escreve é enviado à ferramenta de medição. Ela recebe apenas as contagens descritas acima.",
    ],
  },
  {
    titulo: "O que acontece no WhatsApp",
    texto: [
      "Depois que você envia a mensagem, a conversa passa a seguir as regras do próprio WhatsApp. O ateliê usa o que você escreve só para atender o seu pedido.",
    ],
  },
  {
    titulo: "Os seus direitos",
    texto: [
      "Pela Lei Geral de Proteção de Dados (LGPD), você pode pedir informações sobre os seus dados, a correção ou a eliminação deles. Para isso, fale com o ateliê pelos contatos acima.",
    ],
  },
  {
    titulo: "Mudanças nesta página",
    texto: [
      "Se o site passar a coletar algo novo, esta página será atualizada antes. Última atualização: outubro de 2026.",
    ],
  },
] as const;

export default function Privacidade() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-14 md:py-20">
      <TituloSecao sobretitulo="Privacidade" titulo="Política de privacidade" />

      <div className="mt-12 space-y-10">
        {secoes.map((s) => (
          <section key={s.titulo}>
            <h2 className="font-serif text-2xl text-grafite md:text-3xl">{s.titulo}</h2>
            <div className="mt-3 space-y-3 leading-relaxed text-grafite/80">
              {s.texto.map((paragrafo) => (
                <p key={paragrafo}>{paragrafo}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
