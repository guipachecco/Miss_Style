// Origem de cada clique no WhatsApp; vira o dado do evento `whatsapp_clique`.
export type OrigemWhatsApp =
  | "flutuante"
  | "home_hero"
  | "home_final"
  | "servicos"
  | "contato"
  | "formulario_contato"
  | "rodape"
  | "peca";

// Eventos medidos. Só contagens e rótulos: NUNCA texto digitado pela cliente.
export type EventosMedidos = {
  whatsapp_clique: { origem: OrigemWhatsApp };
  pedido_passo: { passo: number };
  pedido_enviado: undefined;
};

// O script do Umami (cloud.umami.is/script.js) expõe window.umami; ele pode não existir
// (desenvolvimento, bloqueador de anúncios, variável de ambiente ausente).
declare global {
  interface Window {
    umami?: { track: (evento: string, dados?: Record<string, unknown>) => void };
  }
}

export function rastrear<E extends keyof EventosMedidos>(
  evento: E,
  ...dados: EventosMedidos[E] extends undefined ? [] : [EventosMedidos[E]]
): void {
  try {
    if (typeof window === "undefined" || !window.umami) return;
    if (dados.length > 0) window.umami.track(evento, dados[0] as Record<string, unknown>);
    else window.umami.track(evento);
  } catch {
    // Medir nunca pode quebrar a página.
  }
}
