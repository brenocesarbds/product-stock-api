# Product Stock API

API REST desenvolvida com Node.js, Fastify e TypeScript para gerenciamento de catálogo de produtos e controle de movimentações de estoque.

O projeto começou como um CRUD em memória e foi evoluído para utilizar banco de dados relacional (PostgreSQL com Prisma ORM), autenticação via JWT com controle de permissões por perfil de usuário (RBAC), testes automatizados com Vitest e documentação com Swagger.

---

## Tecnologias Utilizadas

- **Node.js** e **TypeScript**
- **Fastify**: servidor HTTP e roteamento
- **PostgreSQL** (via Docker Compose): banco de dados relacional
- **Prisma ORM**: mapeamento de tabelas, migrations, seed e transações (`$transaction`)
- **Zod**: validação de dados de entrada (body, params e query strings) e tipagem de DTOs
- **@fastify/jwt** e **bcryptjs**: autenticação por token JWT e hash de senhas
- **Vitest**: testes unitários (com repositório em memória) e testes E2E (`app.inject`)
- **@fastify/swagger** e **@fastify/swagger-ui**: documentação das rotas em `/docs`

---

## Estrutura do Projeto e Arquitetura

A aplicação utiliza o padrão **Repository** com interfaces desacopladas (`IProductRepository` e `IUserRepository`). Isso permite que as rotas dependam de um contrato em vez de ficarem presas diretamente ao Prisma, facilitando a execução de testes unitários rápidos com implementações `In-Memory`.

```text
product-stock-api/
├── prisma/
│   ├── migrations/                     # Histórico de migrations SQL geradas pelo Prisma
│   ├── schema.prisma                   # Modelagem das tabelas e relacionamentos
│   └── seed.ts                         # Script para popular o banco com dados iniciais
├── src/
│   ├── @types/
│   │   └── fastify-jwt.d.ts            # Tipagem do payload do usuário autenticado no JWT
│   ├── lib/
│   │   └── prisma.ts                   # Instância de conexão com o banco de dados
│   ├── middlewares/
│   │   ├── verify-jwt.ts               # Validação do token JWT nas rotas privadas
│   │   └── verify-user-role.ts         # Verificação de permissão por perfil (ADMIN / OPERATOR)
│   ├── repositories/
│   │   ├── product.repository.interface.ts
│   │   ├── prisma-product.repository.ts
│   │   ├── product.repository.ts       # Implementação In-Memory usada nos testes unitários
│   │   ├── product.repository.spec.ts  # Testes unitários das regras de estoque e paginação
│   │   ├── user.repository.interface.ts
│   │   └── prisma-user.repository.ts
│   ├── routes/
│   │   ├── auth.routes.ts              # Cadastro de usuários e login
│   │   ├── product.routes.ts           # CRUD de produtos e movimentação de estoque
│   │   └── product.routes.e2e.spec.ts  # Testes E2E das rotas HTTP
│   ├── schemas/
│   │   ├── product.schema.ts           # Schemas de validação Zod para produtos
│   │   └── user.schema.ts              # Schemas de validação Zod para usuários e login
│   ├── app.ts                          # Configuração do Fastify, plugins e registro de rotas
│   └── server.ts                       # Inicialização do servidor HTTP
├── .env.example
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

---

## Modelagem e Regras de Negócio

O banco de dados possui 5 tabelas principais modeladas no Prisma:

- **User (`users`)**: armazena nome, e-mail único, hash da senha e perfil de acesso (`ADMIN` ou `OPERATOR`).
- **Category (`categories`)**: categorias de produtos (ex: Eletrônicos, Móveis, Livros).
- **Supplier (`suppliers`)**: fornecedores vinculados opcionalmente aos produtos.
- **Product (`products`)**: dados do produto, preço (`Decimal(10, 2)`), quantidade em estoque (`stockQuantity`), flag de disponibilidade (`isAvailable`) e chaves estrangeiras para categoria e fornecedor.
- **StockMovement (`stock_movements`)**: histórico de entradas (`IN`) e saídas (`OUT`) de estoque, registrando quantidade, motivo (`reason`), qual produto foi alterado (`productId`) e qual usuário realizou a operação (`userId`).

### Principais regras implementadas:
1. **Movimentação atômica de estoque**: ao chamar `PATCH /products/:id/stock`, a atualização do saldo na tabela de produtos e a criação do registro na tabela de movimentações rodam dentro de um `prisma.$transaction`. Se qualquer etapa falhar, nenhuma alteração é salva.
2. **Bloqueio de saldo negativo**: saídas (`OUT`) maiores que a quantidade atual disponível em estoque são recusadas com erro `400 Bad Request`.
3. **Atualização automática de disponibilidade**: o campo `isAvailable` é atualizado automaticamente conforme o saldo do produto (`stockQuantity > 0`).
4. **Controle de acesso (RBAC)**:
   - Rotas de listagem e busca são públicas.
   - A movimentação de estoque exige que o usuário esteja autenticado (`OPERATOR` ou `ADMIN`), vinculando o ID do usuário extraído do token JWT (`request.user.sub`) ao histórico da movimentação.
   - Criação, edição e exclusão de produtos são restritas a usuários com perfil `ADMIN`.

---

## Rotas da API

| Método | Rota | Descrição | Permissão | Status de Sucesso |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/ping` | Verificação de status da API | Pública | `200 OK` |
| `GET` | `/docs` | Documentação interativa (Swagger UI) | Pública | `200 OK` |
| `POST` | `/users` | Cadastro de novo usuário | Pública | `201 Created` |
| `POST` | `/sessions` | Login e geração do token JWT | Pública | `200 OK` |
| `GET` | `/products` | Listagem de produtos com paginação (`page`, `limit`) e filtros (`categoryId`, `minPrice`, `maxPrice`) | Pública | `200 OK` |
| `GET` | `/products/:id` | Busca de um produto específico pelo ID | Pública | `200 OK` |
| `POST` | `/products` | Cadastro de um novo produto | `ADMIN` | `201 Created` |
| `PUT` | `/products/:id` | Atualização de dados de um produto | `ADMIN` | `200 OK` |
| `PATCH` | `/products/:id/stock` | Entrada (`IN`) ou saída (`OUT`) de estoque | Autenticado (`OPERATOR` / `ADMIN`) | `200 OK` |
| `DELETE` | `/products/:id` | Exclusão de um produto | `ADMIN` | `204 No Content` |

---

## Como Executar Localmente

### Pré-requisitos
- Node.js (v20 ou superior)
- Docker e Docker Compose

### 1. Instalar as dependências
```bash
npm install
```

### 2. Configurar as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:
```env
DATABASE_URL="postgresql://postgres:docker@localhost:5432/product_stock_db?schema=public"
PORT=3333
JWT_SECRET="chave-secreta-desenvolvimento"
```

### 3. Subir o banco de dados PostgreSQL com Docker
```bash
docker compose up -d
```

### 4. Rodar as migrations e o seed inicial
```bash
npx prisma migrate dev
npx prisma db seed
```
*(O seed cria as categorias iniciais, um fornecedor, um produto de exemplo e o usuário administrador padrão: `admin@stock.com` / senha `123456`).*

### 5. Iniciar o servidor em desenvolvimento
```bash
npm run dev
```
- Servidor: `http://localhost:3333`
- Documentação Swagger: `http://localhost:3333/docs`

---

## Testes Automatizados

Para rodar os testes unitários e os testes E2E com o Vitest:

```bash
npm test
```

Para rodar em modo watch durante o desenvolvimento:

```bash
npm run test:watch
```

---

## Build e Produção

Para gerar o cliente do Prisma e compilar o código TypeScript para JavaScript na pasta `dist/`:

```bash
npm run build
```

Para aplicar as migrations pendentes em ambiente de produção e iniciar o servidor compilado:

```bash
npm start
```
