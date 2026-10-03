import { describe, expect, it } from "vitest";
import { caracteresRestantes, LIMITE_DETALHES, limparPasso, sanitizarRespostas, validarData, type RespostasPedido } from "./pedido";

const hoje = new Date(2026, 9, 2, 23, 30); // 2 out 2026, 23h30 no fuso local

describe("validarData", () => {
  it("aceita data futura", () => expect(validarData("2027-03-15", hoje)).toEqual({ ok: true }));
  it("aceita hoje mesmo às 23h30", () => expect(validarData("2026-10-02", hoje)).toEqual({ ok: true }));
  it("recusa o dia anterior como passada", () =>
    expect(validarData("2026-10-01", hoje)).toEqual({ ok: false, motivo: "passada" }));
  it("recusa dia inexistente", () =>
    expect(validarData("2026-02-30", hoje)).toEqual({ ok: false, motivo: "formato" }));
  it.each(["15/03/2027", "", "2027-3-5"])("recusa formato inválido: %s", (valor) =>
    expect(validarData(valor, hoje)).toEqual({ ok: false, motivo: "formato" }));
});

describe("caracteresRestantes", () => {
  it("começa no limite", () => expect(caracteresRestantes({})).toBe(LIMITE_DETALHES));
  it("soma tecido, cor e detalhes", () =>
    expect(caracteresRestantes({ tecido: "linho", cor: "azul", detalhes: "manga" })).toBe(500 - 14));
  it("pode ficar negativo", () => expect(caracteresRestantes({ detalhes: "a".repeat(510) })).toBe(-10));
});

describe("limparPasso (o que 'Pular' descarta)", () => {
  const todas: RespostasPedido = {
    ocasiao: "Casamento", ocasiaoOutra: "x", data: "2020-01-01", semData: true,
    tipo: "Vestido", comprimento: "Longo",
    tecido: "linho", cor: "azul", detalhes: "manga", temReferencia: true,
    modeloReferencia: "Vestido A", nome: "Maria",
  };
  it("passo 1 remove ocasião e data e preserva o resto", () =>
    expect(limparPasso(todas, 1)).toEqual({
      tipo: "Vestido", comprimento: "Longo", tecido: "linho", cor: "azul", detalhes: "manga",
      temReferencia: true, modeloReferencia: "Vestido A", nome: "Maria",
    }));
  it("passo 2 remove tipo e comprimento", () => {
    const r = limparPasso(todas, 2);
    expect(r.tipo).toBeUndefined();
    expect(r.comprimento).toBeUndefined();
    expect(r.ocasiao).toBe("Casamento");
  });
  it("passo 3 remove tecido, cor, detalhes e referência própria, mas mantém o modelo de referência", () => {
    const r = limparPasso(todas, 3);
    expect([r.tecido, r.cor, r.detalhes, r.temReferencia]).toEqual([undefined, undefined, undefined, undefined]);
    expect(r.modeloReferencia).toBe("Vestido A");
  });
  it("passo 4 não é pulável e não altera nada", () => expect(limparPasso(todas, 4)).toEqual(todas));
  it("não altera o objeto original", () => {
    const copia = { ...todas };
    limparPasso(todas, 1);
    expect(todas).toEqual(copia);
  });
});

describe("sanitizarRespostas (rascunho vindo do navegador)", () => {
  it("mantém valores válidos", () => {
    const ok: RespostasPedido = { nome: "Ana", ocasiao: "Batizado", tipo: "Saia", comprimento: "Midi", semData: false, temReferencia: true, cor: "azul" };
    expect(sanitizarRespostas(ok)).toEqual(ok);
  });
  it("descarta texto com tipo errado", () => expect(sanitizarRespostas({ nome: 123, cor: ["a"] })).toEqual({}));
  it("descarta opções que não existem mais", () =>
    expect(sanitizarRespostas({ tipo: "Conjunto antigo", ocasiao: "Churrasco", comprimento: "Gigante" })).toEqual({}));
  it("booleanos só se forem booleanos de verdade", () =>
    expect(sanitizarRespostas({ semData: "sim", temReferencia: 1 })).toEqual({}));
  it("ignora chaves desconhecidas", () => expect(sanitizarRespostas({ nome: "Ana", admin: true })).toEqual({ nome: "Ana" }));
  it.each([null, undefined, "texto", 42, [], [{ nome: "Ana" }]])("não-objeto vira {}: %j", (valor) =>
    expect(sanitizarRespostas(valor)).toEqual({}));
});
