**Vídeo de apresentação:** _link a adicionar_

# SpaceLoop

Sistema de gestão de reservas de salas. Quem usa o sistema cadastra os blocos, as salas de cada bloco e os clientes, e registra as reservas das salas por dia e turno.

## Integrantes

_Nome completo, RGM e o que cada integrante fez: a adicionar._

## Tecnologias

| Parte | Tecnologias |
|---|---|
| Banco | PostgreSQL 19 (Docker ou instalado na máquina) e Prisma 7 |
| API | Node.js, Express 5 e TypeScript |
| Validação | Zod, com os schemas no pacote `shared`, usado pela API e pelo frontend |
| Documentação | Swagger em `/docs` |
| Frontend | React 19, Vite 8, TypeScript e Axios |
| Login | Token JWT e senha guardada com o algoritmo bcrypt (biblioteca `bcryptjs`) |

## Estrutura

Um repositório com três pacotes (npm workspaces):

```
shared/     schemas Zod, tipos e regras usados pela API e pelo frontend
api/        API em camadas: routes → controllers → services → repositories
frontend/   interface em React
```

## Tabelas

| Tabela | O que guarda | Campos `@unique` além do id |
|---|---|---|
| `Bloco` | blocos onde ficam as salas | `nome` |
| `Sala` | nome, capacidade, descrição e preço | |
| `Cliente` | nome, CPF, e-mail e telefone | `cpf`, `email` |
| `Reserva` | dia e turno de uma sala para um cliente | |
| `Usuario` | quem entra no sistema (login) | `email` |

Ligações:

- Um **bloco** tem várias **salas** (`Sala.idBloco` aponta para `Bloco`).
- A **reserva** é ligada a duas tabelas: `Reserva.idSala` aponta para `Sala` e `Reserva.idCliente` aponta para `Cliente`.
- `Usuario` é usado apenas no login e não tem ligação com as outras tabelas.
- `Reserva` também tem uma restrição única que combina sala, dia e turno, para a mesma sala não ser reservada duas vezes no mesmo horário.

O modelo completo está em [`api/prisma/schema.prisma`](api/prisma/schema.prisma).

## Como rodar do zero

Os comandos abaixo são para o PowerShell, no Windows.

### 1. Pré-requisitos

- Node.js 20.19 ou mais novo da linha 20, 22.12 ou mais novo da linha 22, ou 24 em diante, com npm.
- Git.
- PostgreSQL 19: pelo Docker **ou** instalado na máquina.

### 2. Baixar e instalar

```powershell
git clone https://github.com/cauaaugustow/SpaceLoop.git
cd SpaceLoop
npm install
```

O `npm install` na raiz instala os três pacotes e compila o `shared`.

### 3. Criar o arquivo `.env` da API

```powershell
Copy-Item api/.env.example api/.env
```

Abra `api/.env` e troque o valor de `JWT_SECRET` por uma chave aleatória. Este comando gera uma:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

| Variável | Para que serve |
|---|---|
| `DATABASE_URL` | endereço do banco: `postgresql://USUARIO:SENHA@localhost:PORTA/spaceloop_db` |
| `JWT_SECRET` | chave que assina o token de login |
| `PORT` | porta da API (padrão 3000) |

### 4. Subir o banco

Escolha **uma** das opções.

**Opção A: Docker.** O `DATABASE_URL` do `.env.example` já está pronto para ela (porta 5434).

```powershell
docker compose up -d
docker compose ps
```

Espere o banco aparecer como `healthy` antes de continuar.

**Opção B: PostgreSQL instalado na máquina.** Com o serviço do PostgreSQL ligado, edite o `DATABASE_URL` em `api/.env` com o seu usuário, a sua senha e a sua porta (a padrão é 5432). Exemplo:

```
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/spaceloop_db"
```

Não é preciso criar o banco `spaceloop_db`: o passo seguinte cria. Se a senha tiver caracteres especiais, eles precisam ser codificados na URL (`@` vira `%40`, `#` vira `%23`).

### 5. Criar as tabelas e os dados de exemplo

Na raiz do projeto:

```powershell
npm run db:generate -w api
npm run db:migrate -w api
npm run db:seed -w api
```

O seed preenche as cinco tabelas e cria o usuário de acesso.

### 6. Subir a API

```powershell
npm run dev -w api
```

- API: <http://localhost:3000>
- Swagger: <http://localhost:3000/docs>

### 7. Subir o frontend

Em **outro terminal**, na raiz do projeto:

```powershell
npm run dev -w frontend
```

Abra o endereço que o Vite mostrar (normalmente <http://localhost:5173>).

O frontend procura a API em `http://localhost:3000`. Se você mudar a `PORT` da API, crie o arquivo com `Copy-Item frontend/.env.example frontend/.env`, ajuste `VITE_API_URL` e reinicie o frontend.

## Usuário para entrar no sistema

Criado pelo seed:

| E-mail | Senha |
|---|---|
| `professor@spaceloop.com` | `professor123` |

Também é possível criar uma conta nova pela tela de cadastro.

## Usando o Swagger

1. Abra <http://localhost:3000/docs>.
2. Em `POST /login`, clique em **Try it out** e depois em **Execute**. O exemplo já usa o usuário do seed.
3. Copie o `token` da resposta.
4. Clique em **Authorize**, cole o token e confirme. As rotas protegidas passam a funcionar.

## Rotas da API

| Rota | O que faz | Precisa de login |
|---|---|---|
| `POST /usuario` | cadastra um usuário | não |
| `POST /login` | entra e devolve o token | não |
| `GET`, `POST` em `/blocos`, `/clientes`, `/salas`, `/reservas` | lista e cria | sim |
| `GET`, `PUT`, `DELETE` em `/blocos/:id` e nas demais | busca, edita e remove | sim |

| Status | Quando acontece |
|---|---|
| 200 | busca, listagem, edição ou login com sucesso |
| 201 | registro criado |
| 204 | registro removido |
| 400 | dado ou ID inválido, ou JSON malformado |
| 401 | sem token válido, ou e-mail e senha incorretos |
| 404 | registro não encontrado |
| 409 | valor repetido, horário já reservado ou remoção de registro em uso |

Os erros têm o formato abaixo; `erros` aparece quando é possível apontar o campo:

```json
{ "mensagem": "Dados inválidos", "erros": [{ "campo": "nome", "mensagem": "O nome precisa ter ao menos 3 caracteres" }] }
```

## Regras do sistema

- A reserva só pode ser marcada para o dia atual ou para uma data futura, no fuso `America/Fortaleza`. Isso também vale ao editar uma reserva antiga.
- Os turnos são manhã, tarde e noite.
- Uma sala tem no máximo uma reserva por dia e turno.
- Não é possível remover um bloco com salas, nem uma sala ou um cliente com reservas.
- A senha nunca aparece nas respostas da API.

## Verificação

Na raiz do projeto:

```powershell
npm run build -w api
npm run build -w frontend
npm test -w api
npm run lint -w frontend
```

Os testes da API precisam do banco ligado. Eles criam bancos temporários e os apagam ao final, por isso o usuário do `DATABASE_URL` precisa de permissão para criar bancos.

## Problemas comuns

| Sintoma | O que fazer |
|---|---|
| Erro de autenticação no banco (`P1000` ou `28P01`) | conferir usuário, senha e porta do `DATABASE_URL` |
| Não conecta no banco (`P1001`) | conferir se o PostgreSQL ou o contêiner está ligado |
| Mudou algo em `shared/src` e a API não percebeu | rodar `npm run build -w shared` |
| A tela diz que não foi possível conectar | conferir se a API está ligada e se `VITE_API_URL` aponta para ela |
