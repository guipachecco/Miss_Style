// Regras do assistente "Monte o seu pedido". Funções puras, sem dependências de React ou Next.

export const OCASIOES = [
  "Casamento",
  "Formatura",
  "Culto ou evento da igreja",
  "Debutante",
  "Batizado",
  "Outra",
] as const;
export const TIPOS_PECA = ["Vestido", "Saia", "Blusa", "Conjunto", "Outra"] as const;
export const COMPRIMENTOS = ["Curto", "Midi", "Longo", "Ainda não sei"] as const;

// Limite somado de tecido + cor + detalhes (mantém o link do WhatsApp num tamanho seguro).
export const LIMITE_DETALHES = 500;

export type Ocasiao = (typeof OCASIOES)[number];
export type TipoPecaPedido = (typeof TIPOS_PECA)[number];
export type Comprimento = (typeof COMPRIMENTOS)[number];

export type RespostasPedido = {
  ocasiao?: Ocasiao;
  ocasiaoOutra?: string;
  data?: string; // "YYYY-MM-DD"
  semData?: boolean;
  tipo?: TipoPecaPedido;
  comprimento?: Comprimento;
  tecido?: string;
  cor?: string;
  detalhes?: string;
  temReferencia?: boolean;
  modeloReferencia?: string;
  nome?: string;
};

export type ResultadoData = { ok: true } | { ok: false; motivo: "formato" | "passada" };

const dois = (n: number) => String(n).padStart(2, "0");

// Compara no fuso local: às 23h30 no Brasil "hoje" continua valendo (toISOString usaria UTC e viraria "amanhã").
export function validarData(data: string, hoje: Date = new Date()): ResultadoData {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data);
  if (!partes) return { ok: false, motivo: "formato" };

  const [ano, mes, dia] = [Number(partes[1]), Number(partes[2]), Number(partes[3])];
  const real = new Date(ano, mes - 1, dia);
  if (real.getFullYear() !== ano || real.getMonth() !== mes - 1 || real.getDate() !== dia) {
    return { ok: false, motivo: "formato" };
  }

  const hojeLocal = `${hoje.getFullYear()}-${dois(hoje.getMonth() + 1)}-${dois(hoje.getDate())}`;
  return data < hojeLocal ? { ok: false, motivo: "passada" } : { ok: true };
}

export function caracteresRestantes(r: Pick<RespostasPedido, "tecido" | "cor" | "detalhes">): number {
  const usados = (r.tecido?.length ?? 0) + (r.cor?.length ?? 0) + (r.detalhes?.length ?? 0);
  return LIMITE_DETALHES - usados;
}

// Campos de cada passo. "Pular" descarta o que estava preenchido nele: pular tem de significar
// "não quero responder isto", senão uma escolha por engano (ou uma data passada) segue na mensagem.
const CAMPOS_DO_PASSO: Record<number, (keyof RespostasPedido)[]> = {
  1: ["ocasiao", "ocasiaoOutra", "data", "semData"],
  2: ["tipo", "comprimento"],
  3: ["tecido", "cor", "detalhes", "temReferencia"], // o modelo de referência vindo da peça fica
};

export function limparPasso(r: RespostasPedido, passo: number): RespostasPedido {
  const campos = CAMPOS_DO_PASSO[passo];
  if (!campos) return r;
  const copia = { ...r };
  for (const campo of campos) delete copia[campo];
  return copia;
}

const TEXTOS = ["ocasiaoOutra", "data", "tecido", "cor", "detalhes", "modeloReferencia", "nome"] as const;
const BOOLEANOS = ["semData", "temReferencia"] as const;

// Tudo o que vem do sessionStorage é desconhecido: aceita campo a campo, só com o tipo e as opções
// que o código de hoje conhece. Um rascunho antigo, ou editado, nunca deve quebrar a página.
export function sanitizarRespostas(dado: unknown): RespostasPedido {
  if (!dado || typeof dado !== "object" || Array.isArray(dado)) return {};
  const origem = dado as Record<string, unknown>;
  const saida: Record<string, unknown> = {};

  for (const chave of TEXTOS) if (typeof origem[chave] === "string") saida[chave] = origem[chave];
  for (const chave of BOOLEANOS) if (typeof origem[chave] === "boolean") saida[chave] = origem[chave];
  if ((OCASIOES as readonly unknown[]).includes(origem.ocasiao)) saida.ocasiao = origem.ocasiao;
  if ((TIPOS_PECA as readonly unknown[]).includes(origem.tipo)) saida.tipo = origem.tipo;
  if ((COMPRIMENTOS as readonly unknown[]).includes(origem.comprimento)) saida.comprimento = origem.comprimento;

  return saida as RespostasPedido;
}
