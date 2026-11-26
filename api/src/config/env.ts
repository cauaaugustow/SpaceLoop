export function lerVariavelObrigatoria(nome: string): string {
  const valorDaVariavel: string | undefined = process.env[nome];
  if (!valorDaVariavel) throw new Error(`Variável de ambiente ${nome} não configurada.`);
  return valorDaVariavel;
}
