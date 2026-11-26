import { useEffect, useRef, type JSX, type ReactNode } from "react";
import { X } from "lucide-react";

type PropriedadesDoModal = {
  titulo: string;
  aoFechar: () => void;
  children: ReactNode;
};

export function Modal({ titulo, aoFechar, children }: PropriedadesDoModal): JSX.Element {
  const referenciaDoDialogo = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogo: HTMLDialogElement | null = referenciaDoDialogo.current;
    if (dialogo && !dialogo.open) dialogo.showModal();
  }, []);

  return (
    <dialog ref={referenciaDoDialogo} className="modal" aria-label={titulo} onClose={aoFechar}>
      <header className="modal-header">
        <h2>{titulo}</h2>
        <button type="button" className="icon-button" aria-label="Fechar" onClick={aoFechar}><X size={18} /></button>
      </header>
      {children}
    </dialog>
  );
}
