export function TituloSecao({
  sobretitulo,
  titulo,
  centralizado = true,
}: {
  sobretitulo?: string;
  titulo: string;
  centralizado?: boolean;
}) {
  return (
    <div className={centralizado ? "text-center" : ""}>
      {sobretitulo && <p className="mb-3 text-xs tracking-[0.28em] text-ouro-escuro uppercase">{sobretitulo}</p>}
      <h2 className="font-serif text-4xl leading-tight text-grafite md:text-5xl">{titulo}</h2>
      <span aria-hidden="true" className={`mt-5 block h-px w-14 bg-ouro ${centralizado ? "mx-auto" : ""}`} />
    </div>
  );
}
