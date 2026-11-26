import { useCallback, useEffect, useState } from "react";
import { lerErrosDaApi } from "../utilitarios/errosDeFormulario";

export type ListaDaApi<Item> = {
  itens: Item[];
  isCarregando: boolean;
  mensagemDeErro: string;
  recarregar: () => void;
};

export function useListaDaApi<Item>(listar: () => Promise<Item[]>): ListaDaApi<Item> {
  const [itens, setItens] = useState<Item[]>([]);
  const [isCarregando, setIsCarregando] = useState<boolean>(true);
  const [mensagemDeErro, setMensagemDeErro] = useState<string>("");
  const [numeroDaRecarga, setNumeroDaRecarga] = useState<number>(0);

  useEffect(() => {
    let isEfeitoAtivo: boolean = true;
    listar()
      .then((itensRecebidos: Item[]) => {
        if (!isEfeitoAtivo) return;
        setItens(itensRecebidos);
        setMensagemDeErro("");
      })
      .catch((erro: unknown) => {
        if (isEfeitoAtivo) setMensagemDeErro(lerErrosDaApi(erro).mensagemGeral);
      })
      .finally(() => {
        if (isEfeitoAtivo) setIsCarregando(false);
      });
    return () => {
      isEfeitoAtivo = false;
    };
  }, [listar, numeroDaRecarga]);

  const recarregar = useCallback((): void => setNumeroDaRecarga((numeroAtual: number) => numeroAtual + 1), []);

  return { itens, isCarregando, mensagemDeErro, recarregar };
}
