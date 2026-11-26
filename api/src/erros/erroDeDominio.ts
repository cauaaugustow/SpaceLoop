export class ErroDeDominio extends Error {
  readonly statusCode: number;
  readonly campo: string | undefined;

  constructor(mensagem: string, statusCode: number = 400, campo?: string) {
    super(mensagem);
    this.name = "ErroDeDominio";
    this.statusCode = statusCode;
    this.campo = campo;
  }
}
