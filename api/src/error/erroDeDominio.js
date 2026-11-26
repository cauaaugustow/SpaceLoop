export class ErroDeDominio extends Error {
  constructor(mensagem, statusCode = 400) {
    super(mensagem);
    this.name = "ErroDeDominio";
    this.statusCode = statusCode;
  }
}