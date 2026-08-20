# Family Finance — Backend

API REST para gestão financeira familiar (multi-usuário), com autenticação JWT, controle de transações, categorias, cartões, orçamentos mensais e um dashboard de resumo financeiro.

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

Family Finance é uma API para famílias organizarem suas finanças em conjunto. Cada usuário pertence a uma **household** (o "núcleo familiar"), e todos os dados financeiros — transações, categorias, cartões e orçamentos — são compartilhados entre os membros da mesma household, permitindo que mais de uma pessoa registre e acompanhe os gastos do mesmo grupo.

O backend expõe a API consumida pelo [family-finance-frontend](https://github.com/Caua-Vieira/family-finance-frontend), responsável pela interface web.

---

## Arquitetura

O projeto organiza o código em camadas inspiradas em Clean Architecture, separando regras de negócio de detalhes de infraestrutura:

```
src/
├── domain/          # Contratos (interfaces de repositório), DTOs e erros de negócio
├── application/     # Casos de uso (regras de negócio)
├── infrastructure/  # Implementações concretas: TypeORM, controllers, rotas, DI, config
├── middleware/       # Autenticação JWT e tratamento de erros
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

| Entidade      | Descrição                                                                 |
|---------------|----------------------------------------------------------------------------|
| `Household`   | Núcleo familiar; agrupa usuários e todos os dados financeiros              |
| `User`        | Usuário autenticável, pertence a uma household                            |
| `Category`    | Categoria de transação, com suporte a hierarquia (categoria pai/filha)     |
| `Card`        | Cartão associado a um usuário dono, dentro da household                    |
| `Transaction` | Lançamento de receita (`income`) ou despesa (`expense`)                    |
| `Budget`      | Orçamento estimado por categoria, mês e ano                                |

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
| Injeção de Dependência | typescript-ioc                |
| Containerização        | Docker + Docker Compose       |
| CI/CD                  | GitHub Actions                |

---

## Funcionalidades

- **Autenticação** — Registro (cria a household junto com o primeiro usuário) e login, com token JWT válido por 1 dia
- **Categorias** — CRUD com suporte a subcategorias (categoria pai/filha)
- **Cartões** — CRUD de cartões vinculados a um usuário responsável
- **Transações** — CRUD de receitas e despesas, com filtros por período, valor, tipo, categoria e cartão
- **Importação via Planilha** — Upload de arquivo Excel (`.xlsx`/`.xls`, até 5MB) para importar despesas em lote
- **Orçamentos (Budgets)** — Definição de valor estimado de gasto por categoria/mês/ano, com filtros
- **Dashboard** — Resumo mensal com receitas, despesas, saldo, gasto por categoria (orçado vs. realizado) e comparação com o mês anterior
- **Isolamento por Household** — Todas as consultas são escopadas ao `householdId` do usuário autenticado
- **Tratamento de Erros Centralizado** — Exceções de domínio mapeadas para respostas HTTP padronizadas

---

## Endpoints da API

### Autenticação

| Método | Rota            | Descrição                                          | Auth |
|--------|-----------------|-----------------------------------------------------|------|
| POST   | `/api/auth/register` | Cria a household e o primeiro usuário — retorna token JWT | Não  |
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

**Filtros disponíveis (GET, via query string):** `startDate`, `endDate`, `minAmount`, `maxAmount`, `type`, `categoryId`, `cardId`

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
```

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

---

## Estrutura do Projeto

```
family-finance-backend/
├── .github/
│   └── workflows/
│       └── ci.yml
├── src/
│   ├── domain/
│   │   ├── contracts/
│   │   ├── errors/
│   │   └── types/
│   ├── application/
│   │   └── usecases/
│   │       └── auth/
│   ├── infrastructure/
│   │   ├── config/
│   │   ├── database/
│   │   │   └── migrations/
│   │   ├── entities/
│   │   ├── interfaces/
│   │   │   ├── controllers/
│   │   │   └── routes/
│   │   └── repositories/
│   ├── middleware/
│   │   ├── auth-middleware.ts
│   │   └── error-handler.ts
│   ├── app.ts
│   └── server.ts
├── docker-compose.yml
├── tsconfig.json
└── package.json
```

---
