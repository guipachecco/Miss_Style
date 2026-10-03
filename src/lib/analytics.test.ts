import { afterEach, describe, expect, it, vi } from "vitest";
import { rastrear } from "./analytics";

afterEach(() => vi.unstubAllGlobals());

describe("rastrear", () => {
  it("não faz nada nem lança erro sem window (servidor)", () => {
    expect(() => rastrear("pedido_enviado")).not.toThrow();
  });

  it("não lança erro quando o script do Umami não carregou", () => {
    vi.stubGlobal("window", {});
    expect(() => rastrear("pedido_passo", { passo: 2 })).not.toThrow();
  });

  it("envia evento com dados", () => {
    const track = vi.fn();
    vi.stubGlobal("window", { umami: { track } });
    rastrear("whatsapp_clique", { origem: "rodape" });
    expect(track).toHaveBeenCalledWith("whatsapp_clique", { origem: "rodape" });
  });

  it("envia evento sem dados só com o nome", () => {
    const track = vi.fn();
    vi.stubGlobal("window", { umami: { track } });
    rastrear("pedido_enviado");
    expect(track).toHaveBeenCalledWith("pedido_enviado");
  });

  it("engole erro lançado pelo track", () => {
    vi.stubGlobal("window", {
      umami: {
        track: () => {
          throw new Error("falhou");
        },
      },
    });
    expect(() => rastrear("pedido_passo", { passo: 1 })).not.toThrow();
  });
});
