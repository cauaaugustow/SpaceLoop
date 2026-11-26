export const FUSO_HORARIO: string = "America/Fortaleza";

const formatoDia: Intl.DateTimeFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: FUSO_HORARIO,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function hojeNoFusoDaAplicacao(): string {
  const partes: Record<string, string> = Object.fromEntries(
    formatoDia.formatToParts(new Date()).map(({ type, value }: Intl.DateTimeFormatPart): [string, string] => [type, value]),
  );
  return `${partes.year}-${partes.month}-${partes.day}`;
}

export function isDataExistente(dia: string): boolean {
  const data: Date = new Date(`${dia}T00:00:00.000Z`);
  return !Number.isNaN(data.getTime()) && data.toISOString().slice(0, 10) === dia;
}
