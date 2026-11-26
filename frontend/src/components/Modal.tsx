import { useEffect, useRef, type JSX, type ReactNode, type RefObject } from "react";

type PropriedadesDoModal = {
  titulo: string;
  aoFechar: () => void;
  children: ReactNode;
};

export function Modal({ titulo, aoFechar, children }: PropriedadesDoModal): JSX.Element {
  const referenciaDoDialogo: RefObject<HTMLDialogElement | null> = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogo: HTMLDialogElement | null = referenciaDoDialogo.current;
    if (dialogo && !dialogo.open) dialogo.showModal();
  }, []);

  return (
    <dialog ref={referenciaDoDialogo} className="modal" aria-label={titulo} onClose={aoFechar}>
      <header className="modal-header">
        <h2>{titulo}</h2>
        <button type="button" className="modal-close" onClick={aoFechar}>Fechar</button>
      </header>
      {children}
    </dialog>
  );
}
