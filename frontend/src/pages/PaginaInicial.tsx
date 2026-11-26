import type { JSX } from "react";
import type { Usuario } from "../types/usuario";

type PropriedadesDaPaginaInicial = {
  usuario: Usuario;
  aoSair: () => void;
};

export function PaginaInicial({ usuario, aoSair }: PropriedadesDaPaginaInicial): JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-start justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Olá, {usuario.nome}!</h1>
      <p>As telas de blocos, salas, clientes e reservas estão em construção.</p>
      <button type="button" className="rounded-md border px-4 py-2" onClick={aoSair}>Sair da conta</button>
    </main>
  );
}
