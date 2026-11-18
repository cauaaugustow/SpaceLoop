# SpaceLoop

Sistema de reservas de salas com API em Express, Prisma e SQLite e interface em React com Vite. Usuários podem consultar a disponibilidade e fazer ou cancelar suas reservas. Administradores gerenciam usuários, salas e reservas.

## Requisitos

- Node.js 20.19+ (linha 20), 22.12+ (linha 22) ou 24+, e npm.
- Dois terminais: um para a API e outro para a interface.

## Instalação local

No terminal da API:

```powershell
cd backend
npm ci
Copy-Item .env.example .env
```

Edite `backend/.env` e substitua `JWT_SECRET` por uma chave aleatória própria. É possível gerar uma com `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. `DATABASE_URL="file:./dev.db"` cria o banco local, que não é versionado.

Em seguida:

```powershell
npm run db:generate
npm run db:migrate
npm run dev
```

No terminal da interface, a partir da raiz do projeto:

```powershell
cd web
npm ci
Copy-Item .env.example .env
npm run dev
```

O Vite mostra o endereço da interface no terminal. A API usa a porta 3000 por padrão. Se mudar `PORT` no backend, atualize `VITE_API_URL` em `web/.env` e reinicie o Vite. `APP_TIME_ZONE` e `VITE_APP_TIME_ZONE` devem ter o mesmo fuso IANA; o padrão é `America/Fortaleza`.

## Primeiro administrador

Cadastre uma conta pela interface. Depois, no terminal do backend, execute:

```powershell
npm run admin:promote -- usuario@exemplo.com
```

Saia da conta e entre novamente para abrir o painel administrativo. O comando exige acesso ao ambiente do servidor e promove apenas uma conta já cadastrada.

## Regras de reserva

- As reservas e a consulta de disponibilidade aceitam somente o dia atual ou uma data futura no fuso configurado.
- Os turnos aceitos são `MANHA`, `TARDE` e `NOITE` (a API também aceita letras minúsculas).
- Uma sala pode ter uma reserva por dia e turno. Conflitos retornam HTTP 409.
- Usuários comuns acessam apenas suas próprias reservas; administradores acessam todas.

## Verificação

No diretório `backend`, execute `npm test` e `npx prisma validate`. No diretório `web`, execute `npm run lint` e `npm run build`.

O banco `backend/dev.db` contém dados locais e deve permanecer fora do Git. Se uma versão anterior do projeto com esse banco foi compartilhada, remover o arquivo do estado atual não apaga cópias e commits antigos; avalie a limpeza do histórico com quem usa o repositório e troque as credenciais expostas.
