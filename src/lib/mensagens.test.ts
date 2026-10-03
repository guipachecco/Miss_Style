import { describe, expect, it } from "vitest";
import { mensagemPadrao, montarMensagemPedido } from "./mensagens";
import { limparPasso } from "./pedido";
import { linkWhatsApp } from "./site";

describe("montarMensagemPedido", () => {
  it("monta o exemplo completo da spec", () => {
    expect(
      montarMensagemPedido({
        nome: "Maria",
        tipo: "Vestido",
        comprimento: "Longo",
        ocasiao: "Casamento",
        data: "2027-03-15",
        tecido: "linho",
        cor: "azul-marinho",
        detalhes: "manga curta, decote canoa",
        modeloReferencia: "Vestido longo rosa com capelete",
        temReferencia: true,
      }),
    ).toBe(
      "Olá! Meu nome é Maria. Quero encomendar um vestido longo para um casamento em 15/03/2027. Tecido: linho. Cor: azul-marinho. Detalhes: manga curta, decote canoa. Modelo de referência: Vestido longo rosa com capelete. Vou enviar uma foto de referência por aqui.",
    );
  });

  it("só o nome", () =>
    expect(montarMensagemPedido({ nome: "Maria" })).toBe("Olá! Meu nome é Maria. Gostaria de fazer uma encomenda."));

  it("sem nome", () => expect(montarMensagemPedido({})).toBe("Olá! Gostaria de fazer uma encomenda."));

  it("omite comprimento 'Ainda não sei' e a data quando semData", () =>
    expect(
      montarMensagemPedido({ nome: "Ana", tipo: "Saia", comprimento: "Ainda não sei", ocasiao: "Formatura", semData: true }),
    ).toBe("Olá! Meu nome é Ana. Quero encomendar uma saia para uma formatura."));

  it("ocasião Outra usa o texto digitado", () =>
    expect(
      montarMensagemPedido({ nome: "Ana", ocasiao: "Outra", ocasiaoOutra: "meu aniversário de 15 anos", data: "2027-01-10" }),
    ).toBe("Olá! Meu nome é Ana. Quero encomendar uma peça para meu aniversário de 15 anos em 10/01/2027."));

  it("ocasião Outra sem texto é omitida", () =>
    expect(montarMensagemPedido({ nome: "Ana", tipo: "Blusa", ocasiao: "Outra" })).toBe(
      "Olá! Meu nome é Ana. Quero encomendar uma blusa.",
    ));

  it("data sem ocasião", () =>
    expect(montarMensagemPedido({ nome: "Ana", tipo: "Vestido", data: "2027-03-15" })).toBe(
      "Olá! Meu nome é Ana. Quero encomendar um vestido para o dia 15/03/2027.",
    ));

  it.each([
    [{ tipo: "Saia", comprimento: "Longo" }, "uma saia longa"],
    [{ tipo: "Blusa", comprimento: "Curto" }, "uma blusa curta"],
    [{ tipo: "Conjunto", comprimento: "Longo" }, "um conjunto longo"],
    [{ tipo: "Saia", comprimento: "Midi" }, "uma saia midi"],
    [{ tipo: "Outra", comprimento: "Curto" }, "uma peça curta"],
    [{ comprimento: "Longo" }, "uma peça de comprimento longo"],
  ] as const)("concorda o gênero do comprimento: %j", (resposta, esperado) =>
    expect(montarMensagemPedido({ nome: "Ana", ...resposta })).toBe(`Olá! Meu nome é Ana. Quero encomendar ${esperado}.`));

  it("pular o passo 1 descarta a data passada que estava na tela", () =>
    expect(montarMensagemPedido(limparPasso({ nome: "Ana", ocasiao: "Casamento", data: "2026-10-01" }, 1))).toBe(
      "Olá! Meu nome é Ana. Gostaria de fazer uma encomenda.",
    ));

  it("debutante vira 'festa de debutante'", () =>
    expect(montarMensagemPedido({ nome: "Ana", tipo: "Vestido", ocasiao: "Debutante" })).toBe(
      "Olá! Meu nome é Ana. Quero encomendar um vestido para uma festa de debutante.",
    ));

  it("ignora campos só com espaços e normaliza quebra de linha no nome", () =>
    expect(montarMensagemPedido({ nome: 'Maria "Duda" 🌸\nSilva', tecido: "   " })).toBe(
      'Olá! Meu nome é Maria "Duda" 🌸 Silva. Gostaria de fazer uma encomenda.',
    ));

  it("no pior caso (500 caracteres de acento e espaço) o link fica abaixo de 4000", () => {
    // cada "ã " vira 9 caracteres no link (%C3%A3%20); é a mistura mais cara possível
    const msg = montarMensagemPedido({
      nome: "Maria",
      tipo: "Vestido",
      ocasiao: "Casamento",
      data: "2027-03-15",
      tecido: "ã ".repeat(83),
      cor: "ã ".repeat(83),
      detalhes: "ã ".repeat(84),
      modeloReferencia: "Vestido longo rosa com capelete",
      temReferencia: true,
    });
    expect(linkWhatsApp(msg).length).toBeLessThan(4000);
  });
});

describe("mensagemPadrao", () => {
  it("flutuante", () =>
    expect(mensagemPadrao("flutuante")).toBe(
      "Olá! Vim pelo site da Miss Style e gostaria de conversar sobre uma peça sob medida.",
    ));
  it.each(["home_hero", "home_final", "contato"] as const)("%s", (origem) =>
    expect(mensagemPadrao(origem)).toBe("Olá! Vim pelo site da Miss Style e gostaria de fazer uma encomenda."));
  it("servicos", () =>
    expect(mensagemPadrao("servicos")).toBe(
      "Olá! Vim pelo site da Miss Style e gostaria de saber mais sobre os serviços.",
    ));
  it("rodape não leva mensagem", () => expect(mensagemPadrao("rodape")).toBe(""));
  it("peca cita o nome do modelo", () =>
    expect(mensagemPadrao("peca", { pecaNome: "Vestido longo rosa com capelete" })).toBe(
      'Olá! Vi o modelo "Vestido longo rosa com capelete" no site da Miss Style e gostaria de um modelo assim.',
    ));
});
