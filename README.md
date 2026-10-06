# Family Finance — Backend

API REST para gestão financeira familiar (multi-usuário), com autenticação JWT, controle de transações, lançamentos recorrentes, categorias, cartões, extrato de fatura, orçamentos mensais, dashboard de resumo financeiro e relatório mensal por e-mail.

> **Frontend:** o cliente web deste projeto vive em um repositório separado — [family-finance-frontend](https://github.com/Caua-Vieira/family-finance-frontend).

## Sumário

- [Sobre o Projeto](#sobre-o-projeto)
- [Arquitetura](#arquitetura)
- [Modelo de Domínio](#modelo-de-domínio)
- [Tecnologias](#tecnologias)
- [Funcionalidades](#funcionalidades)
- [Endpoints da API](#endpoints-da-api)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Rodando com Docker](#rodando-com-docker)
- [Rodando Localmente (sem Docker)](#rodando-localmente-sem-docker)
- [Migrations](#migrations)
- [CI/CD](#cicd)
- [Estrutura do Projeto](#estrutura-do-projeto)

---

## Sobre o Projeto

Family Finance é uma API para famílias organizarem suas finanças em conjunto. Cada usuário pertence a uma **household** (o "núcleo familiar"), e todos os dados financeiros — transações, recorrências, categorias, cartões, extratos e orçamentos — são compartilhados entre os membros da mesma household, permitindo que mais de uma pessoa registre e acompanhe os gastos do mesmo grupo. Novos membros entram na household existente usando o **código de convite** dela.

O backend expõe a API consumida pelo [family-finance-frontend](https://github.com/Caua-Vieira/family-finance-frontend), responsável pela interface web.

---

## Arquitetura

O projeto organiza o código em camadas inspiradas em Clean Architecture, separando regras de negócio de detalhes de infraestrutura:

```
src/
├── domain/          # Contratos (interfaces de repositório), DTOs e erros de negócio
├── application/     # Casos de uso (regras de negócio)
├── infrastructure/  # Implementações concretas: TypeORM, controllers, rotas, DI, config
├── middleware/       # Autenticação JWT, autenticação dos crons e tratamento de erros
├── app.ts            # Configuração do Express (middlewares e rotas)
└── server.ts          # Bootstrap: conexão com o banco e subida do servidor
```

**Fluxo de uma requisição autenticada:**

```
Request → authMiddleware (valida JWT) → Controller → UseCase → Repository (TypeORM) → PostgreSQL
```

Todo o acesso a dados é escopado por `householdId`, extraído do token JWT — garantindo que uma household nunca enxergue dados de outra.

---

## Modelo de Domínio

| Entidade               | Descrição                                                                 |
|------------------------|----------------------------------------------------------------------------|
| `Household`            | Núcleo familiar; agrupa usuários e todos os dados financeiros. Tem um código de convite único |
| `User`                 | Usuário autenticável, pertence a uma household                            |
| `Category`             | Categoria de transação, com suporte a hierarquia (categoria pai/filha)     |
| `Card`                 | Cartão associado a um usuário dono, dentro da household                    |
| `Transaction`          | Lançamento de receita (`income`) ou despesa (`expense`); pode ter sido gerado por uma recorrência |
| `RecurringTransaction` | Regra de lançamento mensal (dia do mês, início, fim opcional, ativa/pausada) |
| `StatementEntry`       | Item de detalhamento da fatura de um cartão. Puramente informativo: não entra no dashboard nem no orçamento |
| `Budget`               | Orçamento estimado por categoria, mês e ano                                |

---

## Tecnologias

| Categoria              | Tecnologia                   |
|------------------------|-------------------------------|
| Runtime                | Node.js                       |
| Linguagem              | TypeScript 5.x                |
| Framework Web          | Express.js 5.x                |
| Banco de Dados         | PostgreSQL                    |
| ORM                    | TypeORM                       |
| Autenticação           | JWT (jsonwebtoken) + bcrypt   |
| Upload de Arquivos     | Multer                        |
| Importação de Planilhas| SheetJS (xlsx)                |
| E-mail                 | Nodemailer (SMTP, via Resend) |
| Injeção de Dependência | typescript-ioc                |
| Containerização        | Docker + Docker Compose       |
| CI/CD e Agendamentos   | GitHub Actions                |

---

## Funcionalidades

- **Autenticação** — Registro e login, com token JWT válido por 1 dia. No registro, o usuário cria uma nova household (`householdName`) ou entra em uma existente (`inviteCode`)
- **E-mail de boas-vindas** — Enviado no cadastro, com o código de convite da household
- **Household** — Consulta dos dados da household do usuário, incluindo o código de convite
- **Categorias** — CRUD com suporte a subcategorias (categoria pai/filha)
- **Cartões** — CRUD de cartões vinculados a um usuário responsável
- **Transações** — CRUD de receitas e despesas, com filtros por período, valor, tipo, categoria e cartão
- **Importação via Planilha** — Upload de arquivo Excel (`.xlsx`/`.xls`, até 5MB) para importar despesas em lote
- **Transações Recorrentes** — Regras mensais (dia do mês, início e fim opcional) que podem ser pausadas. O lançamento do mês atual é gerado na criação da regra, e os meses seguintes são gerados por um cron mensal. Ao consultar meses futuros, as regras ativas aparecem como lançamentos **projetados** (`isProjected`)
- **Extrato de Fatura** — Detalhamento dos itens da fatura de cada cartão (`StatementEntry`), filtrável por período e cartão. É informativo e não altera os totais do dashboard nem do orçamento
- **Importação de Extrato** — Upload do CSV/planilha da fatura em duas etapas (prévia → confirmação). O leitor detecta separador (`,` `;` tab), codificação (UTF-8/Latin-1), linhas antes do cabeçalho e valores em `1.234,56` ou `1,234.56`
- **Orçamentos (Budgets)** — Definição de valor estimado de gasto por categoria/mês/ano, com filtros
- **Dashboard** — Resumo mensal com receitas, despesas, saldo, gasto por categoria (orçado vs. realizado) e comparação com o mês anterior. Para meses futuros, o resumo é uma projeção (`isProjection: true`) baseada nas recorrências
- **Relatório Mensal por E-mail** — Todo dia 1º, cada membro de cada household recebe por e-mail o resumo financeiro do mês anterior
- **Isolamento por Household** — Todas as consultas são escopadas ao `householdId` do usuário autenticado
- **Tratamento de Erros Centralizado** — Exceções de domínio mapeadas para respostas HTTP padronizadas

---

## Endpoints da API

### Autenticação

| Método | Rota            | Descrição                                          | Auth |
|--------|-----------------|-----------------------------------------------------|------|
| POST   | `/api/auth/register` | Cria o usuário (em uma nova household ou via código de convite) — retorna token JWT | Não  |
| POST   | `/api/auth/login`    | Login — retorna token JWT                          | Não  |

**Body — Registro:**
```json
{
  "name": "Fulano",
  "email": "usuario@email.com",
  "password": "suasenha",
  "householdName": "Família Silva"
}
```

Para entrar em uma household existente, troque `householdName` por `inviteCode`:
```json
{
  "name": "Ciclano",
  "email": "outro@email.com",
  "password": "suasenha",
  "inviteCode": "ABC123"
}
```

> O código de convite tem 6 caracteres e aparece no frontend, na barra lateral, e no e-mail de boas-vindas.

**Body — Login:**
```json
{
  "email": "usuario@email.com",
  "password": "suasenha"
}
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

Todos os endpoints abaixo exigem o header:
```
Authorization: Bearer <token>
```

A exceção são os endpoints disparados pelos crons (`/api/recurring/generate` e `/api/reports/monthly-summary`), que usam o `CRON_SECRET` no lugar do JWT:
```
Authorization: Bearer <CRON_SECRET>
```

### Categorias

| Método | Rota                | Descrição                    |
|--------|---------------------|-------------------------------|
| POST   | `/api/categories`   | Cria uma categoria (ou subcategoria, com `parentId`) |
| GET    | `/api/categories`   | Lista as categorias da household |
| PUT    | `/api/categories/:id` | Atualiza uma categoria      |
| DELETE | `/api/categories/:id` | Remove uma categoria        |

### Cartões

| Método | Rota            | Descrição                     |
|--------|-----------------|---------------------------------|
| POST   | `/api/cards`    | Cadastra um novo cartão         |
| GET    | `/api/cards`    | Lista os cartões da household   |
| PUT    | `/api/cards/:id`  | Atualiza um cartão            |
| DELETE | `/api/cards/:id`  | Remove um cartão              |

### Transações

| Método | Rota                     | Descrição                                              |
|--------|--------------------------|----------------------------------------------------------|
| POST   | `/api/transactions/import` | Importa despesas em lote a partir de um arquivo Excel (`multipart/form-data`, campo `file`) |
| POST   | `/api/transactions`      | Cria uma transação                                      |
| GET    | `/api/transactions`      | Lista transações (filtros via query string)              |
| PUT    | `/api/transactions/:id`  | Atualiza uma transação                                   |
| DELETE | `/api/transactions/:id`  | Remove uma transação                                     |

**Body (POST/PUT):**
```json
{
  "type": "expense",
  "amount": 150.90,
  "description": "Supermercado",
  "date": "2026-08-01",
  "categoryId": "1",
  "cardId": "2"
}
```

**Filtros disponíveis (GET, via query string):** `startDate`, `endDate`, `minAmount`, `maxAmount`, `type`, `categoryId`, `cardId`, `month`, `year`

> Quando `month` e `year` são informados e apontam para um mês futuro, a resposta inclui os lançamentos projetados das recorrências ativas, marcados com `isProjected: true`.

### Transações Recorrentes

| Método | Rota                     | Descrição                                              | Auth |
|--------|--------------------------|--------------------------------------------------------|------|
| GET    | `/api/recurring`         | Lista as regras de recorrência da household            | JWT  |
| POST   | `/api/recurring`         | Cria uma regra e já gera o lançamento do mês atual     | JWT  |
| PUT    | `/api/recurring/:id`     | Atualiza uma regra (inclusive pausar/reativar com `active`) | JWT  |
| DELETE | `/api/recurring/:id`     | Remove uma regra                                       | JWT  |
| POST   | `/api/recurring/generate`| Gera os lançamentos do mês para todas as regras ativas (body opcional: `month`, `year`) | `CRON_SECRET` |

**Body (POST/PUT):**
```json
{
  "type": "expense",
  "amount": 120.00,
  "description": "Internet",
  "categoryId": "3",
  "cardId": null,
  "dayOfMonth": 10,
  "startDate": "2026-09-01",
  "endDate": null
}
```

### Extrato de Fatura (Statement Entries)

| Método | Rota                          | Descrição                                   |
|--------|-------------------------------|---------------------------------------------|
| GET    | `/api/statement-entries`      | Lista itens de fatura (filtros: `startDate`, `endDate`, `cardId`) |
| POST   | `/api/statement-entries`      | Cria um item de fatura                      |
| PUT    | `/api/statement-entries/:id`  | Atualiza um item de fatura                  |
| DELETE | `/api/statement-entries/:id`  | Remove um item de fatura                    |
| POST   | `/api/statement-entries/import/preview` | Lê um extrato (`.csv`, `.xlsx` ou `.xls`, até 5MB) e devolve a prévia dos itens **sem salvar**: marca os que já existem no cartão (`duplicate`) e sugere a subcategoria pelo histórico (`suggestedCategoryId`). `multipart/form-data` com `file` e `cardId` |
| POST   | `/api/statement-entries/import` | Salva os itens revisados: `{ "cardId": 2, "entries": [{ "date", "description", "amount", "categoryId" }] }` (máx. 1000) |

**Body (POST/PUT):**
```json
{
  "cardId": 2,
  "categoryId": 5,
  "description": "Farmácia",
  "amount": 48.90,
  "date": "2026-09-12"
}
```

### Orçamentos (Budgets)

| Método | Rota              | Descrição                       |
|--------|-------------------|-----------------------------------|
| POST   | `/api/budgets`    | Cria um orçamento para categoria/mês/ano |
| GET    | `/api/budgets`    | Lista orçamentos (filtros: `month`, `year`, `categoryId`) |
| PUT    | `/api/budgets/:id`  | Atualiza um orçamento          |
| DELETE | `/api/budgets/:id`  | Remove um orçamento            |

**Body (POST/PUT):**
```json
{
  "categoryId": "1",
  "month": 8,
  "year": 2026,
  "estimatedAmount": 800.00
}
```

### Usuários

| Método | Rota          | Descrição                          |
|--------|---------------|---------------------------------------|
| GET    | `/api/users`  | Lista os usuários da household        |

### Household

| Método | Rota              | Descrição                                                   |
|--------|-------------------|-------------------------------------------------------------|
| GET    | `/api/household`  | Retorna a household do usuário (`id`, `name`, `currency`, `inviteCode`) |

### Dashboard

| Método | Rota                    | Descrição                                              |
|--------|-------------------------|----------------------------------------------------------|
| GET    | `/api/dashboard/summary`  | Resumo do mês (filtros opcionais: `month`, `year` — default: mês/ano atuais) |

**Resposta:**
```json
{
  "month": 8,
  "year": 2026,
  "income": 5000.00,
  "expenses": 3200.50,
  "balance": 1799.50,
  "categories": [
    {
      "categoryId": 1,
      "categoryName": "Alimentação",
      "budgeted": 800.00,
      "spent": 650.30,
      "percentageSpent": 81.29
    }
  ],
  "previousMonth": {
    "month": 7,
    "year": 2026,
    "income": 4800.00,
    "expenses": 3500.00,
    "expensesVariationPercentage": -8.56
  }
}
```

> Para meses futuros, a resposta inclui `"isProjection": true` e os totais consideram as recorrências ativas.

### Relatórios

| Método | Rota                           | Descrição                                                | Auth |
|--------|--------------------------------|----------------------------------------------------------|------|
| POST   | `/api/reports/monthly-summary` | Envia por e-mail o resumo do mês a todos os membros de todas as households. Sem body, usa o mês anterior; aceita `month` e `year` opcionais | `CRON_SECRET` |

**Resposta:**
```json
{ "sent": 4 }
```

### Health Check

| Método | Rota      | Descrição               | Auth |
|--------|-----------|--------------------------|------|
| GET    | `/health` | Verifica se a API está no ar | Não  |

---

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Servidor
PORT=3333

# Banco de Dados (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=family_finance

# String de conexão usada pela aplicação (TypeORM)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/family_finance

# Autenticação
JWT_SECRET=seu_segredo_jwt_aqui

# Token compartilhado com os crons do GitHub Actions
CRON_SECRET=seu_segredo_cron_aqui

# SMTP (e-mail de boas-vindas e relatório mensal) — ex.: Resend
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=resend
SMTP_PASS=sua_api_key
MAIL_FROM="Family Finance <onboarding@resend.dev>"
```

> O `.env.example` na raiz traz todas essas variáveis. Sem domínio próprio verificado no Resend, o remetente de teste `onboarding@resend.dev` só entrega para o e-mail dono da conta Resend.

> A conexão com o banco é feita via `DATABASE_URL`. Ao apontar para um provedor gerenciado (ex: Neon), o SSL é habilitado automaticamente.

---

## Rodando com Docker

### Pré-requisitos

- [Docker](https://www.docker.com/) instalado
- [Docker Compose](https://docs.docker.com/compose/) instalado

### Passo a passo

**1. Clone o repositório:**
```bash
git clone https://github.com/Caua-Vieira/family-finance-backend.git
cd family-finance-backend
```

**2. Configure o `.env`** conforme a seção [Variáveis de Ambiente](#variáveis-de-ambiente).

**3. Suba o banco de dados PostgreSQL:**
```bash
docker-compose up -d
```

Isso iniciará o **PostgreSQL** na porta `5432`.

**4. Instale as dependências:**
```bash
npm install
```

**5. Rode as migrations:**
```bash
npm run migration:run
```

**6. Inicie a aplicação:**
```bash
npm run dev
```

### Parando os serviços

```bash
docker-compose down
```

Para remover também os volumes (dados persistidos):
```bash
docker-compose down -v
```

---

## Rodando Localmente (sem Docker)

### Pré-requisitos

- Node.js 18+
- PostgreSQL instalado e rodando

**1.** Configure as variáveis de ambiente apontando para sua instância local (ou um banco gerenciado).

**2.** Instale as dependências:
```bash
npm install
```

**3.** Rode as migrations:
```bash
npm run migration:run
```

**4.** Inicie a aplicação:
```bash
npm run dev     # ambiente de desenvolvimento (ts-node-dev)
```

Para build de produção:
```bash
npm run build
npm start
```

---

## Migrations

O projeto usa as migrations do TypeORM para versionar o schema do banco:

```bash
npm run migration:generate -- src/infrastructure/database/migrations/NomeDaMigration
npm run migration:run
npm run migration:revert
```

---

## CI/CD

O projeto possui um pipeline de **GitHub Actions** configurado em `.github/workflows/ci.yml`, executado automaticamente a cada push ou pull request nas branches `main` e `dev`.

**Etapas do pipeline:**

```
1. Checkout do código
2. Configurar Node.js 22
3. Instalar dependências (npm ci)
4. Build (npm run build)
```

> Lint e testes automatizados serão adicionados ao pipeline assim que forem configurados no projeto.

### Tarefas agendadas

A API não roda crons internamente. Dois workflows do GitHub Actions chamam endpoints protegidos por `CRON_SECRET` (configurado como *secret* no repositório) na API em produção:

| Workflow                     | Agenda                          | Endpoint                          | O que faz                                   |
|------------------------------|---------------------------------|-----------------------------------|---------------------------------------------|
| `generate-recurring.yml`     | Dia 1º de cada mês, 06:00 UTC   | `POST /api/recurring/generate`    | Gera os lançamentos do mês das recorrências ativas |
| `send-monthly-report.yml`    | Dia 1º de cada mês, 08:00 (Brasília) | `POST /api/reports/monthly-summary` | Envia o resumo do mês anterior por e-mail |

Os dois também podem ser disparados manualmente pela aba **Actions** do GitHub (`workflow_dispatch`).

---

## Estrutura do Projeto

```
family-finance-backend/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── generate-recurring.yml
│       └── send-monthly-report.yml
├── src/
│   ├── domain/
│   │   ├── contracts/
│   │   ├── errors/
│   │   └── types/
│   ├── application/
│   │   └── usecases/
│   │       ├── auth/
│   │       └── utils/
│   ├── infrastructure/
│   │   ├── config/
│   │   ├── database/
│   │   │   └── migrations/
│   │   ├── entities/
│   │   ├── interfaces/
│   │   │   ├── controllers/
│   │   │   └── routes/
│   │   ├── repositories/
│   │   └── services/
│   │       └── mail-service/
│   │           └── templates/
│   ├── middleware/
│   │   ├── auth-middleware.ts
│   │   ├── cron-middleware.ts
│   │   └── error-handler.ts
│   ├── utils/
│   ├── app.ts
│   └── server.ts
├── .env.example
├── docker-compose.yml
├── tsconfig.json
└── package.json
```

---
