export function Versiculo({
  texto,
  referencia,
  centralizado = true,
}: {
  texto: string;
  referencia: string;
  centralizado?: boolean;
}) {
  return (
    <figure className={centralizado ? "text-center" : ""}>
      <blockquote className="font-serif text-2xl leading-snug text-grafite italic md:text-3xl">“{texto}”</blockquote>
      <figcaption className="mt-3 text-xs tracking-[0.2em] text-ouro-escuro uppercase">{referencia}</figcaption>
    </figure>
  );
}
