export function lerVariavelObrigatoria(nome: string): string {
  const valor: string | undefined = process.env[nome];
  if (!valor) throw new Error(`Variável de ambiente ${nome} não configurada.`);
  return valor;
}
