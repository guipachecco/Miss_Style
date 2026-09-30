"use client";

import { useState, type FormEvent } from "react";
import { linkWhatsApp } from "@/lib/site";

const campo =
  "mt-2 w-full border border-champagne bg-white/60 px-4 py-3 text-base text-grafite placeholder:text-grafite/40 focus:border-ouro-escuro focus:outline-none";

// Sem servidor: o formulário monta a mensagem e abre o WhatsApp da dona.
// Assim não há e-mail para configurar, spam para filtrar nem dados guardados (LGPD).
export function FormularioContato() {
  const [erro, setErro] = useState("");

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const dados = new FormData(e.currentTarget);
    const nome = String(dados.get("nome") ?? "").trim();
    const peca = String(dados.get("peca") ?? "");
    const quando = String(dados.get("quando") ?? "").trim();
    const mensagem = String(dados.get("mensagem") ?? "").trim();

    if (!nome || !mensagem) {
      setErro("Preencha o seu nome e conte um pouco da sua ideia.");
      return;
    }
    setErro("");

    const linhas = [`Olá! Meu nome é ${nome}.`];
    if (peca) linhas.push(`Tenho interesse em: ${peca}.`);
    if (quando) linhas.push(`Preciso da peça para: ${quando}.`);
    linhas.push("", mensagem);

    window.open(linkWhatsApp(linhas.join("\n")), "_blank", "noopener");
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-6">
      <div>
        <label htmlFor="nome" className="text-sm tracking-wide text-grafite/80">
          Seu nome
        </label>
        <input id="nome" name="nome" type="text" autoComplete="name" className={campo} placeholder="Como podemos te chamar?" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="peca" className="text-sm tracking-wide text-grafite/80">
            Tipo de peça
          </label>
          <select id="peca" name="peca" className={campo} defaultValue="">
            <option value="">Escolha uma opção</option>
            <option>Vestido de festa</option>
            <option>Vestido de noiva</option>
            <option>Vestido de debutante</option>
            <option>Peça sob medida</option>
            <option>Ajuste ou reforma</option>
            <option>Outra peça</option>
          </select>
        </div>
        <div>
          <label htmlFor="quando" className="text-sm tracking-wide text-grafite/80">
            Para quando?
          </label>
          <input id="quando" name="quando" type="text" className={campo} placeholder="Data do evento, se houver" />
        </div>
      </div>

      <div>
        <label htmlFor="mensagem" className="text-sm tracking-wide text-grafite/80">
          Conte a sua ideia
        </label>
        <textarea
          id="mensagem"
          name="mensagem"
          rows={5}
          className={campo}
          placeholder="Cor, tecido, modelo de referência… tudo que imaginar ajuda."
        />
      </div>

      {erro && (
        <p role="alert" className="text-sm text-[#9b2c1f]">
          {erro}
        </p>
      )}

      <button
        type="submit"
        className="w-full rounded-full bg-ouro-escuro px-7 py-3.5 text-sm tracking-[0.14em] text-marfim uppercase transition-colors hover:bg-grafite sm:w-auto"
      >
        Enviar pelo WhatsApp
      </button>
    </form>
  );
}
