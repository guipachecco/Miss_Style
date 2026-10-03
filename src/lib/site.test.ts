import { describe, expect, it } from "vitest";
import { linkWhatsApp, site } from "./site";

describe("linkWhatsApp", () => {
  it("codifica acentos, aspas, emoji e quebra de linha e é reversível", () => {
    const texto = 'Olá! "Duda" 🌸\nSegunda linha: ç ã é';
    const url = new URL(linkWhatsApp(texto));
    expect(url.origin + url.pathname).toBe(`https://wa.me/${site.whatsapp}`);
    expect(url.searchParams.get("text")).toBe(texto);
  });
  it.each([undefined, ""])("sem mensagem (%s) devolve o link simples", (mensagem) =>
    expect(linkWhatsApp(mensagem)).toBe(`https://wa.me/${site.whatsapp}`));
});
