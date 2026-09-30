import { defineArrayMember, defineField, defineType } from "sanity";
import { categorias } from "../lib/categorias";

export const peca = defineType({
  name: "peca",
  title: "Peça",
  type: "document",
  fields: [
    defineField({
      name: "nome",
      title: "Nome da peça",
      description: "Ex.: Vestido longo azul com decote canoa",
      type: "string",
      validation: (r) => r.required().max(80),
    }),
    defineField({
      name: "slug",
      title: "Endereço na internet",
      description: "Clique em Gerar. É o final do link da peça.",
      type: "slug",
      options: { source: "nome", maxLength: 80 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "categoria",
      title: "Categoria",
      type: "string",
      options: { list: categorias.map((c) => ({ title: c.rotulo, value: c.slug })) },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "tipo",
      title: "Como é vendida",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "Sob medida", value: "sob-medida" },
          { title: "Pronta entrega", value: "pronta" },
        ],
      },
      initialValue: "sob-medida",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "disponivel",
      title: "Ainda disponível?",
      description: "Desmarque quando a peça pronta for vendida.",
      type: "boolean",
      initialValue: true,
      hidden: ({ document }) => document?.tipo !== "pronta",
    }),
    defineField({
      name: "resumo",
      title: "Descrição curta",
      type: "text",
      rows: 3,
      validation: (r) => r.required().max(240),
    }),
    defineField({
      name: "detalhes",
      title: "Detalhes da peça",
      description: "Um item por linha: tecido, decote, manga, comprimento…",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "fotos",
      title: "Fotos",
      description: "A primeira foto aparece na galeria. Prefira fotos em pé (formato retrato).",
      type: "array",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Descrição da foto",
              description: "Ex.: Vestido longo azul em manequim. Ajuda quem usa leitor de tela e o Google.",
              type: "string",
            }),
          ],
        }),
      ],
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: "destaque",
      title: "Mostrar na página inicial",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "autorizacaoImagem",
      title: "Tenho autorização de uso de imagem",
      description:
        "Marque se há uma pessoa (cliente) nas fotos e ela, ou o responsável no caso de menores, autorizou a divulgação.",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "nome", subtitle: "categoria", media: "fotos.0" },
  },
});

export const tiposSanity = [peca];
