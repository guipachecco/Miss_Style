// Constantes puras (sem dependências): usadas pelo site E pelo painel do Sanity.

export type Categoria = "vestidos" | "festa" | "noiva" | "debutante" | "sob-medida" | "outros";
export type TipoPeca = "sob-medida" | "pronta";

export const categorias: { slug: Categoria; rotulo: string }[] = [
  { slug: "vestidos", rotulo: "Vestidos" },
  { slug: "festa", rotulo: "Vestidos de festa" },
  { slug: "noiva", rotulo: "Vestidos de noiva" },
  { slug: "debutante", rotulo: "Debutantes" },
  { slug: "sob-medida", rotulo: "Peças sob medida" },
  { slug: "outros", rotulo: "Outras peças" },
];

export function rotuloCategoria(slug: Categoria) {
  return categorias.find((c) => c.slug === slug)?.rotulo ?? slug;
}
