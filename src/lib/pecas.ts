// Camada de dados das peças.
// Fonte principal: Sanity (painel da dona, em /studio).
// Reserva: as peças locais abaixo, usadas SÓ enquanto o Sanity não tiver nenhuma peça publicada
// (ou se o Sanity estiver fora do ar). Quando a dona publicar a primeira peça, o site passa a
// mostrar somente o que está no painel.

import { cache } from "react";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { categorias, rotuloCategoria, type Categoria, type TipoPeca } from "./categorias";

export { categorias, rotuloCategoria };
export type { Categoria, TipoPeca };

export type Peca = {
  slug: string;
  nome: string;
  categoria: Categoria;
  tipo: TipoPeca;
  disponivel: boolean;
  resumo: string;
  detalhes: string[];
  fotos: { src: string; alt: string }[];
  destaque: boolean;
};

// ---------- Reserva local (fotos provisórias, geradas para testar o layout) ----------
// Nomes e descrições seguem a terminologia de modelagem e descrevem só o que aparece nas fotos.
const pecasLocais: Peca[] = [
  {
    slug: "vestido-longo-rosa-com-capelete",
    nome: "Vestido longo rosa com capelete",
    categoria: "festa",
    tipo: "sob-medida",
    disponivel: true,
    resumo: "Vestido longo de saia ampla e fluida, com capelete em babado sobreposto ao corpo.",
    detalhes: ["Capelete sobreposto com barra em babado", "Cintura marcada com franzido", "Saia longa e rodada, de caimento fluido", "Decote redondo"],
    fotos: [{ src: "/pecas/vestido-longo-rosa-capelete.jpg", alt: "Vestido longo rosa com capelete em babado, em manequim" }],
    destaque: true,
  },
  {
    slug: "vestido-longo-amarelo-com-gola-alta",
    nome: "Vestido longo amarelo com gola alta",
    categoria: "festa",
    tipo: "sob-medida",
    disponivel: true,
    resumo: "Vestido longo de gola alta e mangas curtas, com cintura drapeada e saia evasê.",
    detalhes: ["Gola alta", "Mangas curtas em corte quimono", "Cintura com drapeado", "Saia longa evasê"],
    fotos: [{ src: "/pecas/vestido-longo-amarelo-gola-alta.jpg", alt: "Vestido longo amarelo de gola alta, em manequim" }],
    destaque: true,
  },
  {
    slug: "vestido-curto-rosa-com-franzido",
    nome: "Vestido curto rosa com franzido frontal",
    categoria: "vestidos",
    tipo: "sob-medida",
    disponivel: true,
    resumo: "Vestido curto de decote coração, com franzido central ajustável por cordão e saia evasê.",
    detalhes: ["Decote coração", "Franzido frontal com cordão de amarração", "Mangas flare", "Saia evasê com barra ondulada"],
    fotos: [{ src: "/pecas/vestido-curto-rosa-franzido.jpg", alt: "Vestido curto rosa com franzido frontal, em manequim" }],
    destaque: true,
  },
  {
    slug: "vestido-longo-ameixa-com-mangas-amplas",
    nome: "Vestido longo ameixa com mangas amplas",
    categoria: "vestidos",
    tipo: "sob-medida",
    disponivel: true,
    resumo: "Vestido longo de modelagem solta, com mangas curtas amplas e caimento evasê.",
    detalhes: ["Decote redondo", "Mangas curtas amplas em corte quimono", "Modelagem solta", "Saia longa evasê"],
    fotos: [{ src: "/pecas/vestido-longo-ameixa-mangas-amplas.jpg", alt: "Vestido longo na cor ameixa com mangas amplas, em manequim" }],
    destaque: false,
  },
  {
    slug: "vestido-midi-amarelo-com-faixa",
    nome: "Vestido midi amarelo com faixa",
    categoria: "vestidos",
    tipo: "sob-medida",
    disponivel: true,
    resumo: "Vestido midi de modelagem reta, com faixa de amarração e laço na cintura.",
    detalhes: ["Faixa de amarração com laço na cintura", "Mangas curtas", "Decote redondo", "Comprimento midi"],
    fotos: [{ src: "/pecas/vestido-midi-amarelo-faixa.jpg", alt: "Vestido midi amarelo com faixa e laço na cintura, em manequim" }],
    destaque: true,
  },
];

// ---------- Sanity ----------
const client = projectId ? createClient({ projectId, dataset, apiVersion, useCdn: true }) : null;

const consulta = `*[_type == "peca" && defined(slug.current)] | order(_createdAt desc){
  "slug": slug.current,
  nome,
  categoria,
  "tipo": coalesce(tipo, "sob-medida"),
  "disponivel": coalesce(disponivel, true),
  "resumo": coalesce(resumo, ""),
  "detalhes": coalesce(detalhes, []),
  "destaque": coalesce(destaque, false),
  "fotos": coalesce(fotos[defined(asset)]{ "src": asset->url, alt }, [])
}`;

type PecaSanity = Omit<Peca, "fotos"> & { fotos: { src: string; alt?: string }[] };

const carregarTodas = cache(async (): Promise<Peca[]> => {
  if (!client) return pecasLocais;
  try {
    const dados = await client.fetch<PecaSanity[]>(consulta, {}, { next: { revalidate: 60 } });
    if (dados.length === 0) return pecasLocais;
    return dados.map((p) => ({
      ...p,
      // Reduz e converte a foto no CDN do Sanity antes do Next.js otimizar de novo.
      fotos: p.fotos.map((f) => ({ src: `${f.src}?w=1400&auto=format`, alt: f.alt || p.nome })),
    }));
  } catch (erro) {
    console.error("Sanity indisponível; usando peças locais.", erro);
    return pecasLocais;
  }
});

export async function listarPecas(opcoes?: { categoria?: string; destaque?: boolean }) {
  const todas = await carregarTodas();
  return todas.filter(
    (p) =>
      (!opcoes?.categoria || p.categoria === opcoes.categoria) &&
      (opcoes?.destaque === undefined || p.destaque === opcoes.destaque),
  );
}

export async function buscarPeca(slug: string) {
  return (await carregarTodas()).find((p) => p.slug === slug) ?? null;
}

// Só as categorias que têm peça, para não mostrar filtro que leva a uma página vazia.
export async function categoriasComPecas() {
  const usadas = new Set((await carregarTodas()).map((p) => p.categoria));
  return categorias.filter((c) => usadas.has(c.slug));
}
