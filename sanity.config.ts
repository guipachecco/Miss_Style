"use client";

// Configuração do painel (Sanity Studio), montado em /studio. Roda no navegador.
import { ptBRLocale } from "@sanity/locale-pt-br";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { tiposSanity } from "./src/sanity/schema";

export default defineConfig({
  name: "miss-style",
  title: "Miss Style",
  basePath: "/studio",
  projectId,
  dataset,
  plugins: [structureTool(), ptBRLocale()],
  schema: { types: tiposSanity },
  document: {
    // Só há um tipo de documento; o painel da dona não precisa de "novo documento" genérico.
    newDocumentOptions: (prev) => prev.filter((o) => o.templateId === "peca"),
  },
  // Usado por ferramentas que leem esta configuração (ex.: a API de versão).
  api: { apiVersion },
});
