export function converterDiaEmData(dia: string): Date {
  return new Date(`${dia}T00:00:00.000Z`);
}
