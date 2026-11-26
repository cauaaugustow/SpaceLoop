import type { Turno } from "shared";

const formatoDeMoeda: Intl.NumberFormat = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const rotulosDosTurnos: Record<Turno, string> = {
  MANHA: "Manhã",
  TARDE: "Tarde",
  NOITE: "Noite",
};

export function formatarPreco(preco: number): string {
  return formatoDeMoeda.format(preco);
}

export function formatarDia(diaDaApi: string): string {
  const [ano, mes, dia]: string[] = diaDaApi.slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}

export function formatarCpf(cpf: string): string {
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
}

export function normalizarTextoDeBusca(texto: string): string {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}
