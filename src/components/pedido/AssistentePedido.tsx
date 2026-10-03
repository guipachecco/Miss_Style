"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { rastrear } from "@/lib/analytics";
import { montarMensagemPedido } from "@/lib/mensagens";
import {
  COMPRIMENTOS,
  LIMITE_DETALHES,
  OCASIOES,
  TIPOS_PECA,
  caracteresRestantes,
  validarData,
  type RespostasPedido,
} from "@/lib/pedido";
import { apagarRascunho, carregarRascunho, salvarRascunho } from "@/lib/rascunho";
import { classesBotao } from "@/components/ui/Botao";
import { LinkWhatsApp } from "@/components/ui/LinkWhatsApp";

const campo =
  "mt-2 w-full border border-champagne bg-white/60 px-4 py-3 text-base text-grafite placeholder:text-grafite/40 focus:border-ouro-escuro focus:outline-none";

const dois = (n: number) => String(n).padStart(2, "0");
function hojeISO() {
  const h = new Date();
  return `${h.getFullYear()}-${dois(h.getMonth() + 1)}-${dois(h.getDate())}`;
}

function Opcoes<T extends string>({
  valores,
  atual,
  aoEscolher,
}: {
  valores: readonly T[];
  atual?: T;
  aoEscolher: (valor: T) => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {valores.map((valor) => (
        <button
          key={valor}
          type="button"
          aria-pressed={atual === valor}
          onClick={() => aoEscolher(valor)}
          className={`min-h-11 rounded-full border px-5 py-2 text-sm transition-colors ${
            atual === valor
              ? "border-ouro-escuro bg-ouro-escuro text-marfim"
              : "border-champagne text-grafite hover:border-ouro"
          }`}
        >
          {valor}
        </button>
      ))}
    </div>
  );
}

// O rascunho vive no sessionStorage, que o servidor não tem. Só montamos o assistente depois da
// hidratação, para o primeiro desenho do navegador ser igual ao do servidor.
export function AssistentePedido({ modeloReferencia }: { modeloReferencia?: string }) {
  const hidratado = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  if (!hidratado) {
    return <p className="py-10 text-center text-grafite/60">Carregando o assistente…</p>;
  }
  return <Assistente modeloReferencia={modeloReferencia} />;
}

function Assistente({ modeloReferencia }: { modeloReferencia?: string }) {
  const [passo, setPasso] = useState(() => carregarRascunho()?.passo ?? 1);
  const [respostas, setRespostas] = useState<RespostasPedido>(() => {
    const salvas = carregarRascunho()?.respostas ?? {};
    return modeloReferencia ? { ...salvas, modeloReferencia } : salvas;
  });
  const [erroNome, setErroNome] = useState(false);

  const titulo = useRef<HTMLHeadingElement>(null);
  const passoAnterior = useRef(passo);

  useEffect(() => {
    salvarRascunho({ passo, respostas });
  }, [passo, respostas]);

  useEffect(() => {
    if (passoAnterior.current === passo) return;
    passoAnterior.current = passo;
    titulo.current?.focus();
  }, [passo]);

  const mudar = (parcial: Partial<RespostasPedido>) => setRespostas((r) => ({ ...r, ...parcial }));
  const irPara = (novo: number) => {
    if (novo > passo) rastrear("pedido_passo", { passo: novo });
    setPasso(novo);
  };

  const restantes = caracteresRestantes(respostas);
  const limiteDo = (valor?: string) => (valor?.length ?? 0) + Math.max(0, restantes);
  const dataInvalida = !respostas.semData && respostas.data ? validarData(respostas.data) : null;
  const nomePreenchido = (respostas.nome ?? "").trim().length > 0;

  const tituloPasso: Record<number, string> = {
    1: "Para qual ocasião?",
    2: "Que peça você imagina?",
    3: "Conte os detalhes",
    4: "Quase lá",
  };

  return (
    <div className="mt-10">
      <p aria-live="polite" className="text-xs tracking-[0.25em] text-ouro-escuro uppercase">
        {passo < 4 ? `Passo ${passo} de 3` : "Último passo"}
      </p>
      <div aria-hidden="true" className="mt-3 h-1 w-full bg-champagne/60">
        <div className="h-1 bg-ouro-escuro transition-all" style={{ width: `${(Math.min(passo, 4) / 4) * 100}%` }} />
      </div>

      <fieldset className="mt-8 min-w-0">
        <legend className="w-full">
          <h2 ref={titulo} tabIndex={-1} className="font-serif text-3xl text-grafite outline-none md:text-4xl">
            {tituloPasso[passo]}
          </h2>
        </legend>

        {passo === 1 && (
          <div className="mt-4">
            <Opcoes valores={OCASIOES} atual={respostas.ocasiao} aoEscolher={(ocasiao) => mudar({ ocasiao })} />
            {respostas.ocasiao === "Outra" && (
              <div className="mt-5">
                <label htmlFor="ocasiaoOutra" className="text-sm text-grafite/80">
                  Qual ocasião?
                </label>
                <input
                  id="ocasiaoOutra"
                  className={campo}
                  maxLength={80}
                  value={respostas.ocasiaoOutra ?? ""}
                  onChange={(e) => mudar({ ocasiaoOutra: e.target.value })}
                />
              </div>
            )}
            <div className="mt-7">
              <label htmlFor="data" className="text-sm text-grafite/80">
                Data do evento
              </label>
              <input
                id="data"
                type="date"
                min={hojeISO()}
                disabled={respostas.semData}
                className={`${campo} disabled:opacity-50`}
                value={respostas.data ?? ""}
                onChange={(e) => mudar({ data: e.target.value })}
              />
              <label className="mt-3 flex min-h-11 items-center gap-3 text-sm text-grafite/80">
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-ouro-escuro"
                  checked={!!respostas.semData}
                  onChange={(e) => mudar({ semData: e.target.checked })}
                />
                Ainda não sei a data
              </label>
              <p aria-live="polite" className="mt-1 min-h-5 text-sm text-[#9b2c1f]">
                {dataInvalida && !dataInvalida.ok
                  ? dataInvalida.motivo === "passada"
                    ? "Essa data já passou. Confira ou pule esta pergunta."
                    : "Confira a data."
                  : ""}
              </p>
            </div>
          </div>
        )}

        {passo === 2 && (
          <div className="mt-4">
            <Opcoes valores={TIPOS_PECA} atual={respostas.tipo} aoEscolher={(tipo) => mudar({ tipo })} />
            <p className="mt-8 text-sm text-grafite/80">Comprimento</p>
            <Opcoes
              valores={COMPRIMENTOS}
              atual={respostas.comprimento}
              aoEscolher={(comprimento) => mudar({ comprimento })}
            />
          </div>
        )}

        {passo === 3 && (
          <div className="mt-4 space-y-5">
            <div>
              <label htmlFor="tecido" className="text-sm text-grafite/80">
                Tecido
              </label>
              <input
                id="tecido"
                className={campo}
                maxLength={limiteDo(respostas.tecido)}
                placeholder="Ex.: linho, crepe, cetim"
                value={respostas.tecido ?? ""}
                onChange={(e) => mudar({ tecido: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="cor" className="text-sm text-grafite/80">
                Cor
              </label>
              <input
                id="cor"
                className={campo}
                maxLength={limiteDo(respostas.cor)}
                placeholder="Ex.: azul-marinho"
                value={respostas.cor ?? ""}
                onChange={(e) => mudar({ cor: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="detalhes" className="text-sm text-grafite/80">
                Detalhes
              </label>
              <textarea
                id="detalhes"
                rows={4}
                className={campo}
                maxLength={limiteDo(respostas.detalhes)}
                placeholder="Manga, decote, comprimento, bolsos…"
                value={respostas.detalhes ?? ""}
                onChange={(e) => mudar({ detalhes: e.target.value })}
              />
              <p aria-live="polite" className="mt-1 text-xs text-grafite/60">
                {restantes} de {LIMITE_DETALHES} caracteres restantes
              </p>
            </div>

            <label className="flex min-h-11 items-center gap-3 text-sm text-grafite/80">
              <input
                type="checkbox"
                className="h-5 w-5 accent-ouro-escuro"
                checked={!!respostas.temReferencia}
                onChange={(e) => mudar({ temReferencia: e.target.checked })}
              />
              Tenho uma foto de referência
            </label>
            <p className="-mt-3 border-l-2 border-ouro pl-4 text-sm text-grafite/70">
              Tem foto de referência? Envie aqui pelo WhatsApp junto com a mensagem.
            </p>

            {respostas.modeloReferencia && (
              <p className="flex flex-wrap items-center gap-3 text-sm text-grafite/80">
                <span>Modelo de referência: {respostas.modeloReferencia}</span>
                <button
                  type="button"
                  onClick={() => mudar({ modeloReferencia: undefined })}
                  className="min-h-11 text-ouro-escuro underline underline-offset-4"
                >
                  Remover
                </button>
              </p>
            )}
          </div>
        )}

        {passo === 4 && (
          <div className="mt-4">
            <label htmlFor="nome" className="text-sm text-grafite/80">
              Como podemos te chamar?
            </label>
            <input
              id="nome"
              autoComplete="given-name"
              className={campo}
              maxLength={60}
              value={respostas.nome ?? ""}
              onChange={(e) => {
                mudar({ nome: e.target.value });
                setErroNome(false);
              }}
            />
            {erroNome && (
              <p role="alert" className="mt-2 text-sm text-[#9b2c1f]">
                Escreva o seu nome para continuar.
              </p>
            )}

            <p className="mt-8 text-xs tracking-[0.2em] text-dourado-logo uppercase">
              Mensagem que vamos abrir no WhatsApp
            </p>
            <p className="mt-2 border border-champagne bg-champagne/20 p-4 text-sm leading-relaxed whitespace-pre-wrap text-grafite/85">
              {montarMensagemPedido(respostas)}
            </p>
          </div>
        )}
      </fieldset>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        {passo > 1 && (
          <button type="button" onClick={() => irPara(passo - 1)} className={classesBotao("contorno")}>
            Voltar
          </button>
        )}

        {passo < 4 && (
          <>
            <button type="button" onClick={() => irPara(passo + 1)} className={classesBotao("primario")}>
              Continuar
            </button>
            <button
              type="button"
              onClick={() => irPara(passo + 1)}
              className="min-h-11 px-3 text-sm text-grafite/70 underline underline-offset-4"
            >
              Pular
            </button>
          </>
        )}

        {passo === 4 &&
          (nomePreenchido ? (
            <LinkWhatsApp
              evento="pedido_enviado"
              mensagem={montarMensagemPedido(respostas)}
              className={classesBotao("primario")}
              aoClicar={() => apagarRascunho()}
            >
              Enviar pelo WhatsApp
            </LinkWhatsApp>
          ) : (
            <button type="button" onClick={() => setErroNome(true)} className={classesBotao("primario")}>
              Enviar pelo WhatsApp
            </button>
          ))}

        {passo === 4 && (
          <button
            type="button"
            onClick={() => irPara(1)}
            className="min-h-11 px-3 text-sm text-grafite/70 underline underline-offset-4"
          >
            Editar respostas
          </button>
        )}
      </div>
    </div>
  );
}
