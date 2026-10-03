// Textos enviados ao WhatsApp. Funções puras: ficam fáceis de testar e de ajustar em um só lugar.

import type { OrigemWhatsApp } from "./analytics";
import type { RespostasPedido, TipoPecaPedido } from "./pedido";

const INICIO = "Olá! Vim pelo site da Miss Style e gostaria de";

export function mensagemPadrao(origem: OrigemWhatsApp, contexto?: { pecaNome?: string }): string {
  switch (origem) {
    case "flutuante":
      return `${INICIO} conversar sobre uma peça sob medida.`;
    case "servicos":
      return `${INICIO} saber mais sobre os serviços.`;
    case "rodape":
      return "";
    case "peca":
      return contexto?.pecaNome
        ? `Olá! Vi o modelo "${contexto.pecaNome}" no site da Miss Style e gostaria de um modelo assim.`
        : `${INICIO} fazer uma encomenda.`;
    default:
      return `${INICIO} fazer uma encomenda.`;
  }
}

const OBJETO: Record<TipoPecaPedido, string> = {
  Vestido: "um vestido",
  Saia: "uma saia",
  Blusa: "uma blusa",
  Conjunto: "um conjunto",
  Outra: "uma peça",
};
const FEMININO: ReadonlySet<TipoPecaPedido> = new Set(["Saia", "Blusa", "Outra"]);

const OCASIAO: Record<string, string> = {
  Casamento: "um casamento",
  Formatura: "uma formatura",
  "Culto ou evento da igreja": "um culto ou evento da igreja",
  Debutante: "uma festa de debutante",
  Batizado: "um batizado",
};

const aparar = (texto?: string) => (texto ?? "").trim();
const dataBR = (iso: string) => iso.split("-").reverse().join("/");

function comprimentoConcordado(r: RespostasPedido): string {
  if (!r.comprimento || r.comprimento === "Ainda não sei") return "";
  const base = r.comprimento.toLowerCase();
  if (base === "midi") return base;
  return r.tipo && FEMININO.has(r.tipo) ? base.replace(/o$/, "a") : base;
}

export function montarMensagemPedido(r: RespostasPedido): string {
  const nome = aparar(r.nome).replace(/\s+/g, " ");
  const partes = [nome ? `Olá! Meu nome é ${nome}.` : "Olá!"];

  const ocasiao = r.ocasiao === "Outra" ? aparar(r.ocasiaoOutra) : r.ocasiao ? OCASIAO[r.ocasiao] : "";
  const data = !r.semData && r.data ? dataBR(r.data) : "";
  const comprimento = comprimentoConcordado(r);

  if (!r.tipo && !comprimento && !ocasiao && !data) {
    partes.push("Gostaria de fazer uma encomenda.");
  } else {
    let frase = `Quero encomendar ${r.tipo ? OBJETO[r.tipo] : "uma peça"}`;
    if (comprimento) frase += r.tipo ? ` ${comprimento}` : ` de comprimento ${comprimento}`;
    if (ocasiao) frase += ` para ${ocasiao}${data ? ` em ${data}` : ""}`;
    else if (data) frase += ` para o dia ${data}`;
    partes.push(`${frase}.`);
  }

  for (const [rotulo, valor] of [
    ["Tecido", r.tecido],
    ["Cor", r.cor],
    ["Detalhes", r.detalhes],
    ["Modelo de referência", r.modeloReferencia],
  ] as const) {
    if (aparar(valor)) partes.push(`${rotulo}: ${aparar(valor)}.`);
  }
  if (r.temReferencia) partes.push("Vou enviar uma foto de referência por aqui.");

  return partes.join(" ");
}
