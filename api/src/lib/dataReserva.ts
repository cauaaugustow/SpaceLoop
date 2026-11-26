const timeZone: string = process.env.APP_TIME_ZONE || "America/Fortaleza";

const formatoDia: Intl.DateTimeFormat = new Intl.DateTimeFormat("en-US", {
  timeZone,
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
