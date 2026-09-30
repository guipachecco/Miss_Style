"use client";

import Link from "next/link";
import { useState } from "react";
import { navegacao } from "@/lib/site";

export function Header() {
  const [aberto, setAberto] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-champagne/70 bg-marfim/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:h-20">
        <Link href="/" aria-label="Miss Style, página inicial" onClick={() => setAberto(false)}>
          {/* Wordmark em texto: a logo completa é quadrada e ilegível em 48px de altura. */}
          <span className="block font-script text-4xl leading-none text-ouro-escuro md:text-5xl">Miss Style</span>
          <span className="block text-[9px] tracking-[0.32em] text-dourado-logo uppercase md:text-[10px]">
            Ateliê de roupas
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-9 md:flex">
          {navegacao.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm tracking-[0.18em] text-grafite uppercase transition-colors hover:text-ouro-escuro"
            >
              {item.rotulo}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="-mr-2 flex h-11 w-11 items-center justify-center md:hidden"
          aria-expanded={aberto}
          aria-controls="menu-mobile"
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          onClick={() => setAberto((v) => !v)}
        >
          <span className="relative block h-3.5 w-6">
            <span
              className={`absolute left-0 h-px w-6 bg-grafite transition-all ${aberto ? "top-1.5 rotate-45" : "top-0"}`}
            />
            <span
              className={`absolute left-0 h-px w-6 bg-grafite transition-all ${aberto ? "top-1.5 -rotate-45" : "top-3.5"}`}
            />
          </span>
        </button>
      </div>

      {aberto && (
        <nav id="menu-mobile" aria-label="Principal" className="border-t border-champagne/70 bg-marfim md:hidden">
          <ul className="mx-auto max-w-6xl px-5 py-2">
            {navegacao.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setAberto(false)}
                  className="block border-b border-champagne/50 py-4 font-serif text-2xl last:border-0"
                >
                  {item.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
