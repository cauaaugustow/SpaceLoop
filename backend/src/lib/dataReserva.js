const timeZone = process.env.APP_TIME_ZONE || "America/Fortaleza";

const formatoDia = new Intl.DateTimeFormat("en-US", {
  timeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function hojeNoFusoDaAplicacao() {
  const partes = Object.fromEntries(
    formatoDia.formatToParts(new Date()).map(({ type, value }) => [type, value]),
  );
  return `${partes.year}-${partes.month}-${partes.day}`;
}
