// Guarda o andamento do assistente de pedido na aba do navegador (sessionStorage), para que
// atualizar a página ou voltar não apague o que a cliente já escreveu. Nada sai do navegador.
// Nenhuma função lança erro: se o armazenamento estiver bloqueado, o assistente só começa vazio.

import { sanitizarRespostas, type RespostasPedido } from "./pedido";

const CHAVE = "missstyle:pedido:v1";

export type Rascunho = { passo: number; respostas: RespostasPedido };

function armazenamentoPadrao(): Storage | undefined {
  try {
    return globalThis.sessionStorage;
  } catch {
    return undefined;
  }
}

export function carregarRascunho(storage?: Pick<Storage, "getItem">): Rascunho | null {
  try {
    const bruto = (storage ?? armazenamentoPadrao())?.getItem(CHAVE);
    if (!bruto) return null;

    const dado: unknown = JSON.parse(bruto);
    if (!dado || typeof dado !== "object") return null;
    const { passo, respostas } = dado as Partial<Rascunho>;
    if (typeof passo !== "number" || !Number.isInteger(passo) || passo < 1 || passo > 4) return null;
    if (!respostas || typeof respostas !== "object" || Array.isArray(respostas)) return null;
    return { passo, respostas: sanitizarRespostas(respostas) };
  } catch {
    return null;
  }
}

export function salvarRascunho(rascunho: Rascunho, storage?: Pick<Storage, "setItem">): void {
  try {
    (storage ?? armazenamentoPadrao())?.setItem(CHAVE, JSON.stringify(rascunho));
  } catch {
    // cota cheia ou modo privado: seguimos sem guardar
  }
}

export function apagarRascunho(storage?: Pick<Storage, "removeItem">): void {
  try {
    (storage ?? armazenamentoPadrao())?.removeItem(CHAVE);
  } catch {
    // idem
  }
}
