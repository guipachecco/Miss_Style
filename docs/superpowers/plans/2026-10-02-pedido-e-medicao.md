# Monte o seu pedido + medição de cliques — Plano de implementação

> **Para quem executa:** REQUIRED SUB-SKILL: use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para implementar este plano tarefa por tarefa. Os passos usam caixas `- [ ]`.

**Goal:** Levar mais clientes ao WhatsApp do ateliê com conversas já completas, via assistente de pedido em `/pedido`, e medir o resultado com eventos sem dados pessoais.

**Architecture:** Funções puras testadas (`pedido`, `mensagens`, `analytics`, `rascunho`) sustentam um link único `LinkWhatsApp` e um assistente em passos (client component, estado local). Os 8 pontos de WhatsApp atuais passam a usar o link único; o Umami Cloud é carregado só se existir `NEXT_PUBLIC_UMAMI_WEBSITE_ID`.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind 4, Vitest (novo), Umami Cloud.

**Spec:** `docs/superpowers/specs/2026-10-02-pedido-e-medicao-design.md`

**Etapas da spec:** Etapa 1 = Tasks 1 a 4 · Etapa 2 = Tasks 5 a 7 · Etapa 3 = Task 8.

## Global Constraints

- Sem cookies, sem login, sem banco de dados e sem custo novo de hospedagem.
- Nenhum texto digitado pela cliente (nome, data, tecido, cor, detalhes) é enviado ao Umami: só `origem`, `passo` e a contagem de `pedido_enviado`.
- Eventos: `whatsapp_clique { origem }`, `pedido_passo { passo }`, `pedido_enviado`. O botão final do assistente emite `pedido_enviado` e **não** emite `whatsapp_clique`.
- Limite de **500 caracteres** somados em tecido + cor + detalhes. Único campo obrigatório: nome (passo final). Passos 1 a 3 podem ser pulados.
- Opções fixas — Ocasião: Casamento, Formatura, Culto ou evento da igreja, Debutante, Batizado, Outra (com texto). Tipo: Vestido, Saia, Blusa, Conjunto, Outra. Comprimento: Curto, Midi, Longo, Ainda não sei.
- Número do WhatsApp vem de `site.whatsapp` (`src/lib/site.ts`); nunca repetido em outro arquivo.
- Textos em português do Brasil. Estilo e tokens de cor existentes (`ouro-escuro`, `champagne`, `grafite`, `marfim`); componentes novos seguem o padrão de `src/components/`.
- Next.js 16: `params` e `searchParams` são `Promise`; usar os tipos globais `PageProps<"/rota">`.
- Execução em branch `feat/pedido-e-medicao`; **nada vai para `main` nem é enviado ao GitHub sem o OK do usuário.**

## Review Focus

Entradas e condições que a spec implica mas que nenhuma tarefa de rotina cobriria:

1. **Fuso horário:** "hoje" às 23h30 no Brasil não pode virar "data passada" (comparar datas no fuso local, não em UTC). Teste na Task 1.
2. **Nome com aspas, emoji ou quebra de linha:** a mensagem e o link do WhatsApp mantêm o texto íntegro. Teste na Task 2.
3. **Texto no limite de 500 caracteres, no pior caso (acentos e espaços, que viram 9 caracteres por par no link):** o link final continua abaixo de 4000 caracteres, um teto conservador frente aos limites usuais de servidores (cerca de 8 mil). Teste na Task 2.
4. **"Outra" ocasião sem texto, e data sem ocasião:** frases coerentes, sem "para ." nem espaços sobrando. Teste na Task 2.
5. **`sessionStorage` bloqueado, indisponível ou com JSON corrompido/forma errada:** o assistente começa vazio e não quebra. Teste na Task 5.

---

### Task 1: Vitest e regras do pedido (`pedido.ts`)

**Files:**
- Create: `vitest.config.ts`, `src/lib/pedido.ts`, `src/lib/pedido.test.ts`
- Modify: `package.json` (script `"test": "vitest run"`, devDependency `vitest`)

**Interfaces:**
- Produces (`src/lib/pedido.ts`):
  - `OCASIOES`, `TIPOS_PECA`, `COMPRIMENTOS` (`as const`), `LIMITE_DETALHES = 500`
  - `type Ocasiao`, `type TipoPecaPedido`, `type Comprimento` (derivados dos arrays)
  - `type RespostasPedido = { ocasiao?: Ocasiao; ocasiaoOutra?: string; data?: string /* "YYYY-MM-DD" */; semData?: boolean; tipo?: TipoPecaPedido; comprimento?: Comprimento; tecido?: string; cor?: string; detalhes?: string; temReferencia?: boolean; modeloReferencia?: string; nome?: string }`
  - `validarData(data: string, hoje?: Date): { ok: true } | { ok: false; motivo: "formato" | "passada" }`
  - `caracteresRestantes(r: Pick<RespostasPedido, "tecido" | "cor" | "detalhes">): number` (`LIMITE_DETALHES` menos a soma dos comprimentos; pode ser negativo)

- [ ] **Step 1: Criar a branch e instalar o Vitest**

Run: `git switch -c feat/pedido-e-medicao && npm install -D vitest`
Criar `vitest.config.ts` com `environment: "node"`, `include: ["src/**/*.test.ts"]` e o alias `"@"` → `src`. Adicionar o script `"test": "vitest run"`.

- [ ] **Step 2: Escrever o teste que falha** (`src/lib/pedido.test.ts`)

```ts
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
  it("pode ficar negativo", () =>
    expect(caracteresRestantes({ detalhes: "a".repeat(510) })).toBe(-10));
});
```

- [ ] **Step 3: Rodar e confirmar a falha**

Run: `npx vitest run src/lib/pedido.test.ts`
Expected: FAIL (módulo `./pedido` não existe).

- [ ] **Step 4: Implementar `src/lib/pedido.ts`** com as constantes, tipos e as duas funções da seção Interfaces. `validarData` valida por regex `^\d{4}-\d{2}-\d{2}$` mais existência real do dia no calendário, e compara com a data **local** de `hoje` montada por `getFullYear/getMonth/getDate` (nunca `toISOString`).

- [ ] **Step 5: Rodar e confirmar que passa**

Run: `npx vitest run`
Expected: PASS (11 testes).

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts package.json package-lock.json src/lib/pedido.ts src/lib/pedido.test.ts
git commit -m "feat: regras do pedido (opções, validação de data, limite de texto) com Vitest"
```

---

### Task 2: Mensagens do WhatsApp (`mensagens.ts`) e `linkWhatsApp`

**Files:**
- Create: `src/lib/mensagens.ts`, `src/lib/mensagens.test.ts`, `src/lib/site.test.ts`
- Modify: `src/lib/site.ts` (função `linkWhatsApp`)

**Interfaces:**
- Consumes: `RespostasPedido` (Task 1).
- Produces:
  - `type OrigemWhatsApp = "flutuante" | "home_hero" | "home_final" | "servicos" | "contato" | "formulario_contato" | "rodape" | "peca"` — **definido em `src/lib/analytics.ts` na Task 3**; esta tarefa o importa como `import type`. Para a Task 2 compilar sozinha, criar já `src/lib/analytics.ts` contendo apenas esse `export type`.
  - `mensagemPadrao(origem: OrigemWhatsApp, contexto?: { pecaNome?: string }): string`
  - `montarMensagemPedido(r: RespostasPedido): string`
  - `linkWhatsApp(mensagem?: string): string` — sem mensagem (ou vazia) devolve `https://wa.me/<número>` sem `?text=`.

- [ ] **Step 1: Escrever os testes que falham**

`src/lib/mensagens.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { linkWhatsApp } from "./site";
import { mensagemPadrao, montarMensagemPedido } from "./mensagens";

describe("montarMensagemPedido", () => {
  it("monta o exemplo completo da spec", () => {
    expect(
      montarMensagemPedido({
        nome: "Maria", tipo: "Vestido", comprimento: "Longo", ocasiao: "Casamento", data: "2027-03-15",
        tecido: "linho", cor: "azul-marinho", detalhes: "manga curta, decote canoa",
        modeloReferencia: "Vestido longo rosa com capelete", temReferencia: true,
      }),
    ).toBe(
      "Olá! Meu nome é Maria. Quero encomendar um vestido longo para um casamento em 15/03/2027. Tecido: linho. Cor: azul-marinho. Detalhes: manga curta, decote canoa. Modelo de referência: Vestido longo rosa com capelete. Vou enviar uma foto de referência por aqui.",
    );
  });
  it("só o nome", () =>
    expect(montarMensagemPedido({ nome: "Maria" })).toBe("Olá! Meu nome é Maria. Gostaria de fazer uma encomenda."));
  it("sem nome", () => expect(montarMensagemPedido({})).toBe("Olá! Gostaria de fazer uma encomenda."));
  it("omite comprimento 'Ainda não sei' e data quando semData", () =>
    expect(montarMensagemPedido({ nome: "Ana", tipo: "Saia", comprimento: "Ainda não sei", ocasiao: "Formatura", semData: true }))
      .toBe("Olá! Meu nome é Ana. Quero encomendar uma saia para uma formatura."));
  it("ocasião Outra usa o texto digitado", () =>
    expect(montarMensagemPedido({ nome: "Ana", ocasiao: "Outra", ocasiaoOutra: "meu aniversário de 15 anos", data: "2027-01-10" }))
      .toBe("Olá! Meu nome é Ana. Quero encomendar uma peça para meu aniversário de 15 anos em 10/01/2027."));
  it("ocasião Outra sem texto é omitida", () =>
    expect(montarMensagemPedido({ nome: "Ana", tipo: "Blusa", ocasiao: "Outra" })).toBe("Olá! Meu nome é Ana. Quero encomendar uma blusa."));
  it("data sem ocasião", () =>
    expect(montarMensagemPedido({ nome: "Ana", tipo: "Vestido", data: "2027-03-15" }))
      .toBe("Olá! Meu nome é Ana. Quero encomendar um vestido para o dia 15/03/2027."));
  it("debutante vira 'festa de debutante'", () =>
    expect(montarMensagemPedido({ nome: "Ana", tipo: "Vestido", ocasiao: "Debutante" }))
      .toBe("Olá! Meu nome é Ana. Quero encomendar um vestido para uma festa de debutante."));
  it("ignora campos só com espaços e normaliza quebra de linha no nome", () =>
    expect(montarMensagemPedido({ nome: 'Maria "Duda" 🌸\nSilva', tecido: "   " }))
      .toBe('Olá! Meu nome é Maria "Duda" 🌸 Silva. Gostaria de fazer uma encomenda.'));
  it("no pior caso (500 caracteres de acento e espaço) o link fica abaixo de 4000", () => {
    // cada "ã " vira 9 caracteres no link (%C3%A3%20); é a mistura mais cara possível
    const msg = montarMensagemPedido({ nome: "Maria", tipo: "Vestido", ocasiao: "Casamento", data: "2027-03-15", tecido: "ã ".repeat(83), cor: "ã ".repeat(83), detalhes: "ã ".repeat(84), modeloReferencia: "Vestido longo rosa com capelete", temReferencia: true });
    expect(linkWhatsApp(msg).length).toBeLessThan(4000);
  });
});

describe("mensagemPadrao", () => {
  it("flutuante", () => expect(mensagemPadrao("flutuante")).toBe("Olá! Vim pelo site da Miss Style e gostaria de conversar sobre uma peça sob medida."));
  it.each(["home_hero", "home_final", "contato"] as const)("%s", (o) =>
    expect(mensagemPadrao(o)).toBe("Olá! Vim pelo site da Miss Style e gostaria de fazer uma encomenda."));
  it("servicos", () => expect(mensagemPadrao("servicos")).toBe("Olá! Vim pelo site da Miss Style e gostaria de saber mais sobre os serviços."));
  it("rodape não leva mensagem", () => expect(mensagemPadrao("rodape")).toBe(""));
  it("peca cita o nome do modelo", () =>
    expect(mensagemPadrao("peca", { pecaNome: "Vestido longo rosa com capelete" }))
      .toBe('Olá! Vi o modelo "Vestido longo rosa com capelete" no site da Miss Style e gostaria de um modelo assim.'));
});
```

`src/lib/site.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { linkWhatsApp, site } from "./site";

describe("linkWhatsApp", () => {
  it("codifica acentos, aspas, emoji e quebra de linha e é reversível", () => {
    const texto = 'Olá! "Duda" 🌸\nSegunda linha: ç ã é';
    const url = new URL(linkWhatsApp(texto));
    expect(url.origin + url.pathname).toBe(`https://wa.me/${site.whatsapp}`);
    expect(url.searchParams.get("text")).toBe(texto);
  });
  it.each([undefined, ""])("sem mensagem (%s) devolve o link simples", (m) =>
    expect(linkWhatsApp(m)).toBe(`https://wa.me/${site.whatsapp}`));
});
```

- [ ] **Step 2: Rodar e confirmar a falha**

Run: `npx vitest run src/lib`
Expected: FAIL (`mensagens` não existe; `linkWhatsApp("")` ainda devolve `?text=`).

- [ ] **Step 3: Implementar `montarMensagemPedido` e `mensagemPadrao` em `src/lib/mensagens.ts`**

Regras (decididas pela spec e fixadas pelos testes): artigo por tipo (`um vestido`, `uma saia`, `uma blusa`, `um conjunto`, `Outra` → `uma peça`); comprimento em minúsculas, omitido se "Ainda não sei"; ocasião → `um casamento`, `uma formatura`, `um culto ou evento da igreja`, `uma festa de debutante`, `um batizado`, `Outra` → o texto digitado (omitida se vazio); destino `para <ocasião>` + ` em dd/mm/aaaa`; sem ocasião mas com data → `para o dia dd/mm/aaaa`; `semData` ignora a data; sem tipo, comprimento, ocasião e data → `Gostaria de fazer uma encomenda.`; sem tipo mas com ocasião/data → objeto `uma peça`. Todo campo é aparado (`trim`), e no nome sequências de espaço/quebra de linha viram um espaço. `Tecido:`, `Cor:`, `Detalhes:`, `Modelo de referência:` só aparecem se preenchidos; a frase `Vou enviar uma foto de referência por aqui.` só se `temReferencia`.

- [ ] **Step 4: Atualizar `linkWhatsApp(mensagem?: string)` em `src/lib/site.ts`** para omitir `?text=` quando a mensagem for vazia ou ausente.

- [ ] **Step 5: Rodar e confirmar que passa**

Run: `npx vitest run`
Expected: PASS (todos os testes das Tasks 1 e 2).

- [ ] **Step 6: Commit**

```bash
git add src/lib/mensagens.ts src/lib/mensagens.test.ts src/lib/site.ts src/lib/site.test.ts src/lib/analytics.ts
git commit -m "feat: mensagens do WhatsApp (padrão por origem e do assistente) com testes"
```

---

### Task 3: Eventos (`analytics.ts`)

**Files:**
- Modify: `src/lib/analytics.ts` (já contém `OrigemWhatsApp`)
- Create: `src/lib/analytics.test.ts`

**Interfaces:**
- Produces:
  - `type EventosMedidos = { whatsapp_clique: { origem: OrigemWhatsApp }; pedido_passo: { passo: number }; pedido_enviado: undefined }`
  - `rastrear<E extends keyof EventosMedidos>(evento: E, ...dados: EventosMedidos[E] extends undefined ? [] : [EventosMedidos[E]]): void` — chama `window.umami?.track(evento, dados)`; sem `window`, sem `umami` ou se o `track` lançar erro, não faz nada e não propaga. Com `pedido_enviado` chama `track(evento)` apenas com o nome.
  - Declaração global `Window["umami"]?: { track: (evento: string, dados?: Record<string, unknown>) => void }`.

- [ ] **Step 1: Escrever o teste que falha** (`src/lib/analytics.test.ts`)

```ts
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
    vi.stubGlobal("window", { umami: { track: () => { throw new Error("falhou"); } } });
    expect(() => rastrear("pedido_passo", { passo: 1 })).not.toThrow();
  });
});
```

- [ ] **Step 2: Rodar e confirmar a falha**

Run: `npx vitest run src/lib/analytics.test.ts`
Expected: FAIL (`rastrear` não existe).

- [ ] **Step 3: Implementar `rastrear` e a declaração global** em `src/lib/analytics.ts`.

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npx vitest run && npx tsc --noEmit`
Expected: PASS e sem erros de tipo.

- [ ] **Step 5: Commit**

```bash
git add src/lib/analytics.ts src/lib/analytics.test.ts
git commit -m "feat: rastrear() tolerante a falhas para eventos do Umami"
```

---

### Task 4: `LinkWhatsApp` e troca dos 8 pontos

**Files:**
- Create: `src/components/ui/LinkWhatsApp.tsx`
- Modify: `src/components/ui/Botao.tsx`, `src/components/layout/WhatsAppFlutuante.tsx`, `src/components/layout/Footer.tsx:37`, `src/app/page.tsx:24,117`, `src/app/servicos/page.tsx:29`, `src/app/contato/page.tsx:21`, `src/app/galeria/[slug]/page.tsx:74`, `src/components/contato/FormularioContato.tsx:33`

**Interfaces:**
- Consumes: `OrigemWhatsApp`, `rastrear` (Task 3); `mensagemPadrao` (Task 2); `linkWhatsApp` (Task 2).
- Produces:
  - `classesBotao(variante?: "primario" | "contorno", extra?: string): string` exportado de `Botao.tsx` (as classes atuais; `Botao` passa a usá-lo).
  - `LinkWhatsApp(props)` — client component, com `className?: string` e `children: ReactNode`, e `props` uma união discriminada:
    `{ evento?: "whatsapp_clique"; origem: OrigemWhatsApp; mensagem?: string }` (mensagem omitida usa `mensagemPadrao(origem)`; no clique chama `rastrear("whatsapp_clique", { origem })`) **ou**
    `{ evento: "pedido_enviado"; mensagem: string }` (sem origem; no clique chama `rastrear("pedido_enviado")` e **não** emite `whatsapp_clique`).
    Renderiza `<a target="_blank" rel="noopener">` com `href={linkWhatsApp(mensagem)}`.

- [ ] **Step 1: Escrever o `LinkWhatsApp`** conforme a interface. Sem teste unitário (interface); verificado nos passos seguintes.

- [ ] **Step 2: Exportar `classesBotao` em `Botao.tsx`** e fazer `Botao` usá-lo, sem mudar o visual.

- [ ] **Step 3: Trocar os links**, cada um com a sua origem e mantendo o visual atual:

| Local | `origem` | Mensagem |
|---|---|---|
| `WhatsAppFlutuante` | `flutuante` | padrão |
| `page.tsx` botão do hero | `home_hero` | padrão |
| `page.tsx` CTA final | `home_final` | padrão |
| `servicos/page.tsx` | `servicos` | padrão |
| `contato/page.tsx` (número grande) | `contato` | padrão |
| `Footer.tsx` | `rodape` | padrão (vazia → link simples) |
| `galeria/[slug]/page.tsx` | `peca` | `mensagemPadrao("peca", { pecaNome: peca.nome })` |

Nesta tarefa os botões continuam levando direto ao WhatsApp (a religação para `/pedido` é a Task 7). Em `FormularioContato.tsx`, antes do `window.open`, chamar `rastrear("whatsapp_clique", { origem: "formulario_contato" })`.

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit && npm run lint && npx vitest run && npm run build`
Expected: tudo passa. Em `npm run dev`, abrir `/`, `/servicos`, `/contato` e a página de uma peça: cada link abre `wa.me/5547989292833?text=...` com a mesma mensagem de antes; nenhum erro no console do navegador.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "refactor: LinkWhatsApp único com origem; eventos nos 8 pontos de WhatsApp"
```

---

### Task 5: Rascunho em `sessionStorage` (`rascunho.ts`)

**Files:**
- Create: `src/lib/rascunho.ts`, `src/lib/rascunho.test.ts`

**Interfaces:**
- Consumes: `RespostasPedido` (Task 1).
- Produces:
  - `type Rascunho = { passo: number; respostas: RespostasPedido }` (`passo` de 1 a 4)
  - `carregarRascunho(storage?: Pick<Storage, "getItem">): Rascunho | null`
  - `salvarRascunho(rascunho: Rascunho, storage?: Pick<Storage, "setItem">): void`
  - `apagarRascunho(storage?: Pick<Storage, "removeItem">): void`
  - Chave fixa `"missstyle:pedido:v1"`. `storage` padrão: `globalThis.sessionStorage`, lido dentro de `try/catch`; nenhuma função lança erro.

- [ ] **Step 1: Escrever o teste que falha** (`src/lib/rascunho.test.ts`), com um `storage` falso (objeto com `getItem/setItem/removeItem` sobre um `Map`):

```ts
it("devolve null quando não há nada salvo")
it("salva e carrega o mesmo rascunho", ...)             // round-trip com respostas completas
it("devolve null para JSON corrompido", ...)            // getItem → "{nao-e-json"
it("devolve null para forma errada", ...)               // getItem → '{"passo":9,"respostas":{}}' e '{"passo":2}'
it("devolve null se getItem lançar", ...)               // storage bloqueado
it("salvar não lança se setItem lançar", ...)           // cota cheia / modo privado
it("apagar remove a chave 'missstyle:pedido:v1'", ...)  // espiona removeItem
it("sem sessionStorage global não lança em nenhuma função", ...)
```

Cada `it` com corpo e asserções explícitas (valores acima fixam as entradas).

- [ ] **Step 2: Rodar e confirmar a falha**

Run: `npx vitest run src/lib/rascunho.test.ts`
Expected: FAIL (módulo não existe).

- [ ] **Step 3: Implementar `rascunho.ts`** validando a forma (`passo` inteiro de 1 a 4 e `respostas` objeto) antes de devolver.

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/rascunho.ts src/lib/rascunho.test.ts
git commit -m "feat: rascunho do pedido em sessionStorage, tolerante a falhas"
```

---

### Task 6: Assistente `/pedido`

**Files:**
- Create: `src/components/pedido/AssistentePedido.tsx`, `src/app/pedido/page.tsx`

**Interfaces:**
- Consumes: `RespostasPedido`, `OCASIOES`, `TIPOS_PECA`, `COMPRIMENTOS`, `LIMITE_DETALHES`, `validarData`, `caracteresRestantes` (Task 1); `montarMensagemPedido` (Task 2); `rastrear` (Task 3); `LinkWhatsApp` (Task 4); `carregarRascunho/salvarRascunho/apagarRascunho` (Task 5); `buscarPeca` (`src/lib/pecas.ts`).
- Produces: `AssistentePedido(props: { modeloReferencia?: string })` (client component); rota `/pedido` aceitando `?peca=<slug>`.

- [ ] **Step 1: `src/app/pedido/page.tsx`** (server): `metadata` com título "Monte o seu pedido"; lê `searchParams` (Promise), busca a peça por `buscarPeca(slug)` só se `peca` for string e **ignora silenciosamente** slug inexistente; renderiza `AssistentePedido` com `modeloReferencia={peca?.nome}`.

- [ ] **Step 2: `AssistentePedido.tsx`** com o fluxo da spec, seção 5:
  - Estado: `passo` (1 a 4) e `respostas`, restaurados por `carregarRascunho()` em `useEffect` e gravados a cada mudança por `salvarRascunho`.
  - Passos 1 a 3 com **Voltar** e **Pular**; barra "Passo N de 3"; no passo final, "Quase lá" com o campo Nome (obrigatório), o resumo (`montarMensagemPedido`) em área de leitura e o botão **Enviar pelo WhatsApp** (`LinkWhatsApp evento="pedido_enviado" mensagem={montarMensagemPedido(respostas)}`, sem `origem`); link "Editar respostas".
  - Passo 1: botões de `OCASIOES` (Outra abre campo de texto) e data (`<input type="date">`) com a caixa "Ainda não sei a data"; data inválida mostra "essa data já passou" (`validarData`) sem bloquear.
  - Passo 3: campos tecido, cor, detalhes com `maxLength = valorAtual.length + max(0, caracteresRestantes(...))` e contador; aviso "Tem foto de referência? Envie aqui pelo WhatsApp junto com a mensagem" com caixa `temReferencia`; se houver `modeloReferencia`, mostra "Modelo de referência: <nome>" com botão remover.
  - `rastrear("pedido_passo", { passo })` ao avançar. Nenhum texto digitado entra em eventos.
  - Ao clicar em enviar: `apagarRascunho()`.
  - `<noscript>` com um `<a>` simples para `linkWhatsApp(mensagemPadrao("contato"))` (sem rastreamento, que depende de JS).
  - Acessibilidade: `fieldset`/`legend` por passo, foco no título ao trocar de passo, região `aria-live="polite"` com "Passo N de 3", alvos de toque ≥ 44px.
  - Visual: tokens e padrões das outras páginas; mobile primeiro.

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit && npm run lint && npx vitest run && npm run build`
Expected: tudo passa. Em `npm run dev`, no navegador em 375px e em desktop, em `/pedido`:
  - preencher os 3 passos e o nome, conferir o resumo e que o botão abre `wa.me/...` com a mensagem esperada;
  - pular os 3 passos e só informar o nome: mensagem "Olá! Meu nome é X. Gostaria de fazer uma encomenda.";
  - atualizar a página no passo 2: respostas voltam; após enviar e voltar a `/pedido`: formulário vazio;
  - `/pedido?peca=vestido-longo-rosa-com-capelete` mostra o modelo de referência removível; `/pedido?peca=inexistente` abre normal sem erro;
  - digitar acima de 500 caracteres somados não é possível; o contador mostra 0;
  - data de ontem mostra "essa data já passou"; teclado Tab/Enter percorre tudo.

- [ ] **Step 4: Commit**

```bash
git add src/app/pedido src/components/pedido
git commit -m "feat: página /pedido com assistente de 3 passos"
```

---

### Task 7: Religar os botões principais para `/pedido`

**Files:**
- Modify: `src/app/page.tsx` (hero e CTA final), `src/app/servicos/page.tsx`, `src/app/galeria/[slug]/page.tsx`

**Interfaces:**
- Consumes: `Botao`, `LinkWhatsApp`, `classesBotao` (Task 4); rota `/pedido` (Task 6).

- [ ] **Step 1: Home.** No hero, o botão principal passa a ser `Botao href="/pedido"` com o texto "Montar meu pedido"; abaixo do grupo de botões, link menor "Prefiro falar direto no WhatsApp" (`LinkWhatsApp origem="home_hero"`). No CTA final: botão "Fazer minha encomenda" → `/pedido` e link menor `LinkWhatsApp origem="home_final"`.

- [ ] **Step 2: Serviços.** "Pedir um orçamento" → `/pedido`, com o link menor direto (`origem="servicos"`).

- [ ] **Step 3: Página da peça.** "Quero um modelo assim" → `/pedido?peca=<slug>` (usar `encodeURIComponent(peca.slug)`), e o link menor "Prefiro falar direto no WhatsApp" (`origem="peca"`, mensagem de `mensagemPadrao("peca", { pecaNome })`). O botão "Outras formas de contato" permanece.

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit && npm run lint && npx vitest run && npm run build`
Expected: tudo passa. Em `npm run dev`, em 375px: os botões principais levam a `/pedido` (na peça, já com o modelo de referência); os links "Prefiro falar direto" abrem o WhatsApp; botão flutuante, rodapé e página de contato continuam diretos; layout dos botões sem quebra visual.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: botões principais levam ao assistente, com link direto ao WhatsApp ao lado"
```

---

### Task 8: Umami e política de privacidade

**Files:**
- Create: `src/app/privacidade/page.tsx`
- Modify: `src/app/layout.tsx`, `src/components/layout/Footer.tsx` (link "Privacidade"), `.env.example`, `README.md`

**Interfaces:**
- Consumes: variável `NEXT_PUBLIC_UMAMI_WEBSITE_ID` (valor público fornecido pelo usuário).
- Produces: script do Umami carregado via `next/script` (`strategy="afterInteractive"`, `src="https://cloud.umami.is/script.js"`, `data-website-id`, `data-do-not-track="true"`), **somente** se a variável existir e `process.env.NODE_ENV === "production"`.

- [ ] **Step 1: Conferir a documentação do Umami** (cookies, tratamento de IP, país onde os dados ficam, retenção) usando WebFetch na documentação oficial; registrar as conclusões no comentário do commit e usá-las no texto da política. Se os dados ficarem fora do Brasil, a política diz isso.

- [ ] **Step 2: Carregar o script em `layout.tsx`** com as condições da seção Interfaces. Sem a variável, nada é carregado.

- [ ] **Step 3: Escrever `/privacidade`** com: o que é medido (contagens de visitas e dos três eventos), que as respostas do assistente ficam só no navegador até o envio e vão apenas ao WhatsApp do ateliê por ação da cliente, o que o Umami coleta (conforme o Step 1), contato (WhatsApp e Instagram do ateliê). Linguagem simples. Acrescentar o link no rodapé.

- [ ] **Step 4: Documentar** a variável em `.env.example` e no `README.md`; **não** preencher o valor.

- [ ] **Step 5: Verificar**

Run: `npx tsc --noEmit && npm run lint && npx vitest run && npm run build`
Expected: tudo passa. Sem a variável, o HTML de `npm run build && npm start` não contém `cloud.umami.is`. Com `NEXT_PUBLIC_UMAMI_WEBSITE_ID=teste` e build de produção, contém o script com `data-do-not-track`. `/privacidade` abre e o link do rodapé funciona.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: Umami opcional por variável de ambiente e política de privacidade"
```

---

## Depois das tarefas

Revisão final do branch inteiro por um revisor com contexto novo (o método manda), correção do que ele apontar e relatório ao usuário. **Merge em `main`, push e criação da conta no Umami ficam com o usuário.** Depois que o usuário informar o ID do site, definir `NEXT_PUBLIC_UMAMI_WEBSITE_ID` na Vercel e conferir um evento real no painel do Umami.
