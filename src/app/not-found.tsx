import { Botao } from "@/components/ui/Botao";

export default function NaoEncontrada() {
  return (
    <div className="mx-auto max-w-xl px-5 py-28 text-center">
      <p className="font-script text-7xl text-ouro">Ops</p>
      <h1 className="mt-2 font-serif text-4xl text-grafite">Não encontramos esta página</h1>
      <p className="mt-4 text-grafite/75">Ela pode ter mudado de lugar. Que tal ver os nossos modelos?</p>
      <div className="mt-8">
        <Botao href="/galeria">Ver a galeria</Botao>
      </div>
    </div>
  );
}
