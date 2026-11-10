import { z } from "zod";

export const criarReservaSchema = z.object({
  dia: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe o dia no formato AAAA-MM-DD")
    .refine((dia) => {
      const data = new Date(`${dia}T00:00:00.000Z`);
      return (
        !Number.isNaN(data.getTime()) &&
        data.toISOString().slice(0, 10) === dia
      );
    }, "Informe uma data válida")
    .transform((dia) => new Date(`${dia}T00:00:00.000Z`)),

  turno: z.string().trim().min(1, "Informe o turno").transform(
    (turno) => turno.toUpperCase()
  ),

  idUsuario: z.coerce.number().int().positive(),
  idSala: z.coerce.number().int().positive(),
});

export const atualizarReservaSchema = criarReservaSchema
  .omit({ idUsuario: true })
  .partial()
  .refine((dados) => Object.keys(dados).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  });