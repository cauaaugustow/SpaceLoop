import { z } from "zod";
import { hojeNoFusoDaAplicacao } from "../lib/dataReserva.js";

const turnos: string[] = ["MANHA", "TARDE", "NOITE"];

export const criarReservaSchema = z.object({
  dia: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe o dia no formato AAAA-MM-DD")
    .refine((dia) => {
      const data: Date = new Date(`${dia}T00:00:00.000Z`);
      return (
        !Number.isNaN(data.getTime()) &&
        data.toISOString().slice(0, 10) === dia
      );
    }, "Informe uma data válida")
    .refine((dia) => dia >= hojeNoFusoDaAplicacao(), "A data da reserva não pode estar no passado")
    .transform((dia) => new Date(`${dia}T00:00:00.000Z`)),

  turno: z.string().trim().min(1, "Informe o turno")
    .transform((turno) => turno.toUpperCase())
    .refine((turno) => turnos.includes(turno), "O turno deve ser MANHA, TARDE ou NOITE"),

  idSala: z.coerce.number().int().positive(),
}).strict();

export const disponibilidadeSchema = criarReservaSchema.pick({ dia: true, turno: true });

export const atualizarReservaSchema = criarReservaSchema
  .partial()
  .refine((dados) => Object.keys(dados).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  });



export type DadosDeNovaReserva = z.infer<typeof criarReservaSchema>;
export type DadosDeDisponibilidade = z.infer<typeof disponibilidadeSchema>;
export type DadosDeAtualizacaoDeReserva = z.infer<typeof atualizarReservaSchema>;
