"use client";

import type { ReactNode } from "react";
import { rastrear, type OrigemWhatsApp } from "@/lib/analytics";
import { mensagemPadrao } from "@/lib/mensagens";
import { linkWhatsApp } from "@/lib/site";

type Comum = { className?: string; children: ReactNode; "aria-label"?: string; aoClicar?: () => void };

// Dois usos: link comum (conta `whatsapp_clique` com a origem) ou o botão final do assistente
// (conta só `pedido_enviado`, para a comparação entre cliques diretos e pedidos não duplicar).
type Props = Comum &
  (
    | { evento?: "whatsapp_clique"; origem: OrigemWhatsApp; mensagem?: string }
    | { evento: "pedido_enviado"; mensagem: string }
  );

export function LinkWhatsApp(props: Props) {
  const { className, children } = props;
  const mensagem =
    props.evento === "pedido_enviado" ? props.mensagem : (props.mensagem ?? mensagemPadrao(props.origem));

  function aoClicar() {
    if (props.evento === "pedido_enviado") rastrear("pedido_enviado");
    else rastrear("whatsapp_clique", { origem: props.origem });
    props.aoClicar?.();
  }

  return (
    <a
      href={linkWhatsApp(mensagem)}
      target="_blank"
      rel="noopener"
      aria-label={props["aria-label"]}
      className={className}
      onClick={aoClicar}
    >
      {children}
    </a>
  );
}
