import { afterEach, describe, expect, it, vi } from "vitest";
import type { RespostasPedido } from "./pedido";
import { apagarRascunho, carregarRascunho, salvarRascunho, type Rascunho } from "./rascunho";

const CHAVE = "missstyle:pedido:v1";

function storageFalso(inicial: Record<string, string> = {}) {
  const dados = new Map(Object.entries(inicial));
  return {
    getItem: (k: string) => dados.get(k) ?? null,
    setItem: (k: string, v: string) => void dados.set(k, v),
    removeItem: (k: string) => void dados.delete(k),
    dados,
  };
}

const respostas: RespostasPedido = {
  nome: "Maria",
  ocasiao: "Casamento",
  data: "2027-03-15",
  tipo: "Vestido",
  comprimento: "Longo",
  detalhes: "manga curta",
  temReferencia: true,
};

afterEach(() => vi.unstubAllGlobals());

describe("rascunho do pedido", () => {
  it("devolve null quando não há nada salvo", () => expect(carregarRascunho(storageFalso())).toBeNull());

  it("salva e carrega o mesmo rascunho", () => {
    const storage = storageFalso();
    const rascunho: Rascunho = { passo: 3, respostas };
    salvarRascunho(rascunho, storage);
    expect(carregarRascunho(storage)).toEqual(rascunho);
  });

  it("devolve null para JSON corrompido", () =>
    expect(carregarRascunho(storageFalso({ [CHAVE]: "{nao-e-json" }))).toBeNull());

  it.each(['{"passo":9,"respostas":{}}', '{"passo":0,"respostas":{}}', '{"passo":2}', '{"passo":"2","respostas":{}}', "null", "[]"])(
    "devolve null para forma errada: %s",
    (bruto) => expect(carregarRascunho(storageFalso({ [CHAVE]: bruto }))).toBeNull(),
  );

  it("devolve null se getItem lançar (armazenamento bloqueado)", () =>
    expect(
      carregarRascunho({
        getItem: () => {
          throw new Error("SecurityError");
        },
      }),
    ).toBeNull());

  it("salvar não lança se setItem lançar (cota cheia ou modo privado)", () =>
    expect(() =>
      salvarRascunho(
        { passo: 1, respostas },
        {
          setItem: () => {
            throw new Error("QuotaExceededError");
          },
        },
      ),
    ).not.toThrow());

  it("apagar remove a chave do rascunho", () => {
    const storage = storageFalso({ [CHAVE]: '{"passo":1,"respostas":{}}' });
    apagarRascunho(storage);
    expect(storage.dados.has(CHAVE)).toBe(false);
  });

  it("sem sessionStorage global nenhuma função lança erro", () => {
    expect(carregarRascunho()).toBeNull();
    expect(() => salvarRascunho({ passo: 1, respostas })).not.toThrow();
    expect(() => apagarRascunho()).not.toThrow();
  });

  it("usa o sessionStorage global quando nenhum é informado", () => {
    const storage = storageFalso();
    vi.stubGlobal("sessionStorage", storage);
    salvarRascunho({ passo: 2, respostas });
    expect(carregarRascunho()).toEqual({ passo: 2, respostas });
    apagarRascunho();
    expect(carregarRascunho()).toBeNull();
  });
});
