import { z } from "zod";
import { hojeNoFusoDaAplicacao, isDataExistente } from "../dataDaReserva.js";
import { TURNOS } from "../turnos.js";
import { hasAlgumCampo, inteiroPositivo, mensagemDeAtualizacaoVazia } from "./campos.js";

export const criarReservaSchema = z.object({
  dia: z
    .string({ error: "Informe o dia no formato AAAA-MM-DD" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Informe o dia no formato AAAA-MM-DD", abort: true })
    .refine(isDataExistente, { error: "Informe uma data válida", abort: true })
    .refine((dia: string): boolean => dia >= hojeNoFusoDaAplicacao(), "A data da reserva não pode estar no passado"),
  turno: z
    .string({ error: "Informe o turno" })
    .trim()
    .toUpperCase()
    .pipe(z.enum(TURNOS, "O turno deve ser MANHA, TARDE ou NOITE")),
  idSala: inteiroPositivo("Selecione a sala"),
  idCliente: inteiroPositivo("Selecione o cliente"),
});

export const disponibilidadeSchema = criarReservaSchema.pick({ dia: true, turno: true });

export const atualizarReservaSchema = criarReservaSchema.partial().refine(hasAlgumCampo, mensagemDeAtualizacaoVazia);

export type DadosDeNovaReserva = z.infer<typeof criarReservaSchema>;
export type DadosDeDisponibilidade = z.infer<typeof disponibilidadeSchema>;
export type DadosDeAtualizacaoDeReserva = z.infer<typeof atualizarReservaSchema>;
