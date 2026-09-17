-- CreateTable
CREATE TABLE "usuarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "telefone" TEXT,
    "cpf" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "e_admin" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "salas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "capacidade" INTEGER NOT NULL,
    "descricao" TEXT,
    "preco_locacao" REAL NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "reservas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dia" DATETIME NOT NULL,
    "turno" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_sala" INTEGER NOT NULL,
    CONSTRAINT "reservas_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reservas_id_sala_fkey" FOREIGN KEY ("id_sala") REFERENCES "salas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_cpf_key" ON "usuarios"("cpf");
