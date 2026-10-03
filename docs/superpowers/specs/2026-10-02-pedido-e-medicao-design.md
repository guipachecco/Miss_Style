# Monte o seu pedido + medição de cliques — desenho

Data: 2026-10-02 · Projeto: site Miss Style (`site/`) · Status: aguardando revisão da especificação

## 1. Objetivo

Aumentar o número de clientes que iniciam conversa no WhatsApp do ateliê depois de passar pelo site, e fazer com que essas conversas já comecem completas (ocasião, data, peça, tecido, cor). Medir o resultado para decidir com dados.

**Sucesso:** após 2 a 4 semanas de uso, comparar `whatsapp_clique` (diretos) com `pedido_enviado` (pelo assistente). Se o total de conversas iniciadas não aumentar, o assistente não cumpriu o objetivo e reavaliamos.

## 2. Contexto e restrições

- Público: chega pelo Instagram e pelo WhatsApp, em celular. Perfil de igreja; inclui adolescentes (cuidado com dados pessoais).
- O pedido continua sendo fechado no WhatsApp. O site prepara a conversa; não vende sozinho.
- Sem login, sem cadastro, sem banco de dados e sem custo novo de hospedagem.
- A dona do ateliê edita o conteúdo pelo Sanity; esta entrega não altera o painel.
- Hoje o site tem 8 pontos que abrem o WhatsApp (botão flutuante, dois botões da home, serviços, contato, formulário de contato, rodapé e "Quero um modelo assim" em cada peça).
- O link `wa.me` não anexa imagens. Foto de referência deve ser enviada pela cliente no próprio WhatsApp.

## 3. Fora de escopo (subprojetos futuros, cada um com seu ciclo)

Compartilhar peça com prévia bonita, "Minha seleção" (favoritas), calculadora de prazo, pedidos registrados com status, depoimentos, bastidores por peça, provador virtual. Opções do assistente editáveis pelo painel Sanity também ficam para depois.

## 4. Arquitetura

| Arquivo | Responsabilidade | Depende de |
|---|---|---|
| `src/lib/analytics.ts` | `rastrear(evento, dados?)`: chama `window.umami.track` se existir; sem efeito (e sem erro) se o script não estiver carregado | nada |
| `src/lib/mensagens.ts` | Funções puras que geram os textos do WhatsApp: mensagem padrão por origem e `montarMensagemPedido(respostas)` | `site.ts` |
| `src/lib/pedido.ts` | Tipos e regras do assistente: opções fixas (ocasiões, tipos, comprimentos), validação de data, limite de caracteres | nada |
| `src/components/ui/LinkWhatsApp.tsx` | Link único para o WhatsApp. Props: `origem`, `mensagem`, estilo. Registra `whatsapp_clique` com a `origem` | `analytics`, `mensagens` |
| `src/components/pedido/AssistentePedido.tsx` | Assistente em passos (client component). Guarda respostas em estado local e em `sessionStorage` | `pedido`, `mensagens`, `analytics`, `LinkWhatsApp` |
| `src/app/pedido/page.tsx` | Página `/pedido`. Se vier `?peca=slug`, busca a peça e preenche o modelo de referência | `pecas.ts` |
| `src/app/privacidade/page.tsx` | Política de privacidade curta (etapa 3) | — |
| `src/app/layout.tsx` | Carrega o script do Umami somente se `NEXT_PUBLIC_UMAMI_WEBSITE_ID` existir e em produção, com `data-do-not-track="true"` | env |

Sete dos 8 pontos de WhatsApp atuais passam a usar `LinkWhatsApp`, cada um com sua `origem`: `flutuante`, `home_hero`, `home_final`, `servicos`, `contato`, `rodape`, `peca`. O oitavo, o formulário de contato (`FormularioContato.tsx`), abre o WhatsApp por `window.open` e não por um link: ele continua assim e chama `rastrear("whatsapp_clique", { origem: "formulario_contato" })` diretamente antes de abrir.

**Botões principais:** "Falar no WhatsApp" e "Fazer minha encomenda" (home, serviços, página da peça) passam a levar para `/pedido` (na peça: `/pedido?peca=<slug>`). Ao lado, link menor "Prefiro falar direto no WhatsApp" (`LinkWhatsApp`). O botão flutuante e o rodapé continuam diretos.

## 5. Fluxo do assistente (`/pedido`)

Uma pergunta por tela, mobile-first, barra "Passo N de 3", **Voltar** e **Pular** em cada passo.

1. **Ocasião e data.** Opções: Casamento, Formatura, Culto ou evento da igreja, Debutante, Batizado, Outra (campo de texto). Data do evento ou caixa "Ainda não sei a data".
2. **Peça e comprimento.** Tipo: Vestido, Saia, Blusa, Conjunto, Outra. Comprimento: Curto, Midi, Longo, Ainda não sei.
3. **Detalhes.** Tecido, cor, detalhes livres (máx. 500 caracteres no total dos três campos). Aviso: "Tem foto de referência? Envie aqui pelo WhatsApp junto com a mensagem". Se veio de uma peça, mostra "Modelo de referência: <nome>" removível.
4. **Quase lá.** Nome (único campo obrigatório), resumo do que será enviado, botão **Enviar pelo WhatsApp**, possibilidade de voltar e editar.

Todos os passos 1 a 3 podem ser pulados.

### Mensagem gerada (somente campos preenchidos)

> Olá! Meu nome é Maria. Quero encomendar um vestido longo para um casamento em 15/03/2027. Tecido: linho. Cor: azul-marinho. Detalhes: manga curta, decote canoa. Modelo de referência: Vestido longo rosa com capelete. Vou enviar uma foto de referência por aqui.

A frase final sobre a foto aparece apenas quando a cliente marca que tem referência no passo 3.

### Comportamentos de borda

| Situação | Comportamento |
|---|---|
| Atualizar ou voltar a página | Respostas restauradas de `sessionStorage` (leitura e escrita protegidas por `try/catch`; o assistente funciona sem ele) |
| Data no passado | Aviso "essa data já passou"; ela pode corrigir ou pular |
| Texto acima do limite | Contador de caracteres; não permite passar de 500 |
| JavaScript desativado ou falha de script | `<noscript>` com link direto para o WhatsApp |
| Após clicar em enviar | Respostas apagadas do navegador |
| `?peca=` com slug inexistente | Ignora o parâmetro e segue sem modelo de referência |

### Acessibilidade

Campos agrupados com `fieldset` e `legend`; foco move para o título a cada passo; progresso anunciado por região `aria-live`; alvos de toque de pelo menos 44px; tudo operável pelo teclado.

## 6. Medição

Ferramenta: **Umami Cloud, plano gratuito** (eventos personalizados, sem cookies). Alternativas descartadas: contador próprio no Sanity (mais código e token de escrita) e Vercel Analytics (eventos personalizados só em plano pago).

| Evento | Quando | Dados enviados |
|---|---|---|
| `whatsapp_clique` | Clique em qualquer `LinkWhatsApp` | `origem` |
| `pedido_passo` | Ao avançar de passo no assistente | `passo` (número) |
| `pedido_enviado` | Clique em "Enviar pelo WhatsApp" | nenhum |

Limitação conhecida: bloqueadores de anúncios podem ocultar parte dos eventos; os números são um piso, não o total exato.

## 7. Privacidade e LGPD

- Nenhum texto digitado pela cliente (nome, data, tecido, cor, detalhes) é enviado ao Umami. Somente contagens.
- A mensagem com as respostas vai exclusivamente para o WhatsApp do ateliê, por ação da própria cliente.
- Antes de ligar o script (etapa 3), conferir na documentação do Umami como tratam o endereço IP e em que país ficam os dados, e refletir isso na política de privacidade.
- A página `/privacidade` descreve: o que é medido, que não há cookies de rastreamento (se confirmado), que as respostas do assistente ficam apenas no navegador até o envio, e como falar com o ateliê. Recomendada revisão profissional antes de divulgar o site.

## 8. Testes

Adicionar **Vitest** (apenas para funções puras; ambiente `node`). Escrever os testes **antes** da implementação (vermelho → verde):

- `montarMensagemPedido`: todos os campos; só nome; sem data; "Outra" ocasião com texto; com e sem modelo de referência; com e sem foto de referência; trecho no limite de 500 caracteres.
- Validação de data: futura válida, hoje válido, passada inválida, vazia com "ainda não sei", formato inválido.
- `linkWhatsApp`: acentos, quebras de linha e caracteres reservados corretamente codificados; número correto.
- `rastrear`: sem `window.umami` não lança erro; com `window.umami` chama `track` com nome e dados.

A interface do assistente é verificada manualmente no navegador (celular e computador) a cada etapa.

## 9. Entrega em etapas

Cada etapa termina com: testes passando, `tsc`, `eslint`, `next build`, verificação no navegador e um commit próprio.

| Etapa | Entrega | Depende de |
|---|---|---|
| 1 | Vitest, `analytics`, `mensagens`, `pedido` (regras), `LinkWhatsApp` e troca dos 8 links. Nenhuma mudança visível para a cliente | — |
| 2 | Página `/pedido`, assistente completo e religação dos botões principais | — |
| 3 | Script do Umami, variável `NEXT_PUBLIC_UMAMI_WEBSITE_ID` na Vercel, página `/privacidade`, conferência dos números | A dona ou o usuário cria a conta gratuita no Umami e informa o ID do site (valor público) |

As etapas 1 e 2 podem ir ao ar antes da 3; a medição começa quando a 3 for concluída.

## 10. Riscos

1. O assistente pode reduzir cliques diretos (mais um passo). Mitigação: link direto mantido ao lado dos botões principais; a medição mostra o efeito real.
2. Opções e textos do assistente são hipóteses sobre o atendimento da dona. Mitigação: ela revisa antes da divulgação.
3. Dados do Umami Cloud podem ficar fora do Brasil. Mitigação: conferir antes da etapa 3 e informar na política de privacidade.
4. Bloqueadores de anúncios subestimam os números. Mitigação: tratar como piso.
