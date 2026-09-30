// Dados fixos do ateliê. Quando o Sanity entrar, parte disto vira "Configurações do site" editável.

export const site = {
  nome: "Miss Style",
  subtitulo: "Ateliê de roupas",
  frase: "Aqui, transformamos ideias em roupas que valorizam o seu estilo.",
  cidade: "Jaraguá do Sul, SC",
  instagram: { usuario: "misstyle_atelie", url: "https://www.instagram.com/misstyle_atelie/" },
  // Somente dígitos, com DDI+DDD. Confirmar com a dona se é o número público.
  whatsapp: "5547989292833",
  whatsappExibicao: "(47) 98929-2833",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export function linkWhatsApp(mensagem: string) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(mensagem)}`;
}

// Versículos: trechos idênticos em ARC e ACF. Confirmar a versão com a dona antes de publicar.
export const versiculos = {
  lirios: { texto: "Olhai para os lírios do campo, como eles crescem.", ref: "Mateus 6:28" },
  maos: { texto: "Todas as mulheres sábias de coração fiaram com as suas mãos.", ref: "Êxodo 35:25" },
  vestidos: { texto: "A força e a honra são os seus vestidos.", ref: "Provérbios 31:25" },
} as const;

export const passos = [
  { titulo: "Você sonha", texto: "Escolha o modelo, o tecido, a cor e todos os detalhes que quiser." },
  { titulo: "Você desenha", texto: "Pode trazer um desenho, uma foto, um modelo da internet ou até mesmo uma ideia na sua cabeça." },
  { titulo: "A gente faz", texto: "Com muito cuidado, técnica e carinho, transformamos o seu desejo em uma peça única." },
  { titulo: "Você veste", texto: "Uma roupa feita especialmente para você, com o caimento perfeito e do seu jeito." },
] as const;

export const servicos = [
  { titulo: "Confecção sob medida", texto: "Peças feitas do zero, nas suas medidas, do jeitinho que você imagina." },
  { titulo: "Modelos exclusivos", texto: "Criamos uma peça única, que ninguém mais terá." },
  { titulo: "Personalização", texto: "Ajustamos um modelo que você gostou: tecido, cor, comprimento, detalhes." },
  { titulo: "Ajustes e reformas", texto: "Cuidamos de uma peça que já existe para que ela sirva perfeitamente em você." },
  { titulo: "Consultoria para escolher o modelo", texto: "Ajudamos a decidir o corte, o tecido e as cores que mais valorizam você." },
  { titulo: "Peças prontas", texto: "Modelos já confeccionados, disponíveis na galeria." },
] as const;

export const navegacao = [
  { href: "/galeria", rotulo: "Galeria" },
  { href: "/servicos", rotulo: "Serviços" },
  { href: "/sobre", rotulo: "Sobre" },
  { href: "/contato", rotulo: "Contato" },
] as const;
