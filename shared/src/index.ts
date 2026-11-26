export const TURNOS: readonly ["MANHA", "TARDE", "NOITE"] = ["MANHA", "TARDE", "NOITE"];

export type Turno = (typeof TURNOS)[number];
