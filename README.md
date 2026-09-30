# Miss Style — site do ateliê

Vitrine digital do ateliê de roupas sob medida Miss Style (Jaraguá do Sul, SC).
Next.js 16 · TypeScript · Tailwind CSS 4 · Sanity (painel de conteúdo).

## Rodar no computador

```bash
npm install
cp .env.example .env.local   # preencha NEXT_PUBLIC_SANITY_PROJECT_ID
npm run dev
```

- Site: http://localhost:3000
- Painel da dona: http://localhost:3000/studio (o endereço precisa estar na lista de CORS do projeto no Sanity)

## Variáveis de ambiente

| Variável | Para quê |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Projeto do Sanity (público, não é segredo) |
| `NEXT_PUBLIC_SANITY_DATASET` | Dataset do Sanity (`production`) |
| `NEXT_PUBLIC_SITE_URL` | Endereço público do site (links e prévias) |
| `NEXT_PUBLIC_INDEXAR` | `1` libera o Google; sem isso o site fica oculto das buscas (modo teste) |

Nunca coloque tokens ou senhas em arquivos versionados.

## Estrutura

```
src/app/            páginas (home, galeria, galeria/[slug], sobre, servicos, contato, studio)
src/components/     layout/, ui/, galeria/, contato/
src/lib/            site.ts (textos fixos, WhatsApp, versículos), pecas.ts (dados), categorias.ts
src/sanity/         schema do painel e configuração
sanity.config.ts    configuração do painel (montado em /studio)
public/             logo, ícone e fotos provisórias
```

## Como as peças chegam ao site

`src/lib/pecas.ts` lê do Sanity e atualiza sozinho em cerca de 1 minuto após a dona publicar.
Enquanto não houver **nenhuma** peça publicada no painel, o site mostra as peças provisórias definidas nesse arquivo.
Ao publicar a primeira peça, o site passa a exibir somente o que está no painel.

## Antes de divulgar

- Trocar as fotos provisórias por fotos reais (e conferir autorização de uso de imagem de quem aparece).
- Confirmar o número de WhatsApp e a versão da Bíblia dos versículos.
- Escrever a história real do ateliê na página Sobre (`src/app/sobre/page.tsx`).
- Definir `NEXT_PUBLIC_INDEXAR=1` e o `NEXT_PUBLIC_SITE_URL` do domínio final.
