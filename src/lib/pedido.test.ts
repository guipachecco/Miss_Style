import { describe, expect, it } from "vitest";
import { caracteresRestantes, LIMITE_DETALHES, validarData } from "./pedido";

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
