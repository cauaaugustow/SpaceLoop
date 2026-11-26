export class ErroDeDominio extends Error {
  readonly statusCode: number;

  constructor(mensagem: string, statusCode: number = 400) {
    super(mensagem);
    this.name = "ErroDeDominio";
    this.statusCode = statusCode;
  }
}
