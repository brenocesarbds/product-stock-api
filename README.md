# 📦 Product Stock API

Uma API REST completa para gerenciamento de catálogo e controle de estoque de produtos, desenvolvida em **Node.js**, **Fastify**, **TypeScript** e **Zod**, adotando o **Repository Pattern** para desacoplamento de regras de negócio e camada de dados.

---

## 🚀 Tecnologias e Ferramentas

- **[Node.js](https://nodejs.org/)** (v20+)
- **[Fastify](https://fastify.dev/)**: Framework web focado em alta performance e baixo overhead.
- **[TypeScript](https://www.typescriptlang.org/)**: Tipagem estática para robustez e previsibilidade do código.
- **[Zod](https://zod.dev/)**: Validação e inferência de schemas de dados em tempo de execução.
- **[TSX](https://github.com/privatenumber/tsx)**: Execução e live-reload em ambiente de desenvolvimento.

---

## 🏛️ Arquitetura

O projeto adota uma arquitetura em camadas baseada no padrão Repository:

```text
product-stock-api/
├── src/
│   ├── schemas/        # Schemas de validação Zod e tipos TypeScript (DTOs)
│   │   └── product.schema.ts
│   ├── repositories/   # Camada de acesso aos dados e persistência em memória
│   │   └── product.repository.ts
│   ├── routes/         # Definição e tratamento das rotas HTTP
│   │   └── product.routes.ts
│   └── server.ts       # Inicialização e configuração do servidor Fastify
├── client.http         # Arquivo para testes das requisições via extensão REST Client
├── package.json
├── tsconfig.json
└── README.md
```

---

## 💼 Regras de Negócio Implementadas

1. **Entidade Produto**:
   - `id`: UUID gerado automaticamente pelo servidor.
   - `name`: string (mínimo de 2 caracteres).
   - `description`: string (mínimo de 5 caracteres).
   - `price`: número positivo (`> 0`).
   - `category`: Enum restrito (`Eletrônicos`, `Vestuário`, `Alimentos`, `Móveis`, `Livros`, `Outros`).
   - `stockQuantity`: número inteiro não negativo (`>= 0`).
   - `isAvailable`: booleano calculado automaticamente com base em `stockQuantity > 0` (se não fornecido explicitamente).

2. **Controle de Estoque (`PATCH /products/:id/stock`)**:
   - Permite entradas (quantidades positivas) e saídas (quantidades negativas).
   - Bloqueia operações que deixariam o saldo negativo, retornando `400 Bad Request`.
   - Recalcula a flag `isAvailable` após qualquer movimentação de estoque.

---

## 🌐 Rotas da API

| Método | Rota | Descrição | Status Sucesso |
| :--- | :--- | :--- | :--- |
| **`GET`** | `/ping` | Health Check da API | `200 OK` |
| **`GET`** | `/products` | Listar produtos (filtros: `category`, `minPrice`, `maxPrice`) | `200 OK` |
| **`GET`** | `/products/:id` | Buscar produto por ID | `200 OK` / `404` |
| **`POST`** | `/products` | Cadastrar novo produto | `201 Created` / `400` |
| **`PUT`** | `/products/:id` | Atualizar dados do produto | `200 OK` / `404` |
| **`PATCH`** | `/products/:id/stock` | Ajustar estoque (entrada ou saída) | `200 OK` / `400` / `404` |
| **`DELETE`**| `/products/:id` | Remover produto do catálogo | `204 No Content` / `404` |

---

## ⚙️ Como Executar o Projeto

### Pré-requisitos
- Node.js instalado (versão 18+)
- npm ou outro gerenciador de pacotes

### 1. Clonar o repositório
```bash
git clone https://github.com/SEU_USUARIO/product-stock-api.git
cd product-stock-api
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Executar em modo de desenvolvimento
```bash
npm run dev
```
O servidor estará disponível em: `http://localhost:3333`

### 4. Build e Produção
```bash
# Compilar TypeScript para JavaScript
npm run build

# Executar a versão compilada
npm start
```

---

## 🧪 Testando as Rotas

O projeto inclui um arquivo [client.http](./client.http) pronto para uso com a extensão **REST Client** (ou Thunder Client) no VS Code.

Basta abrir o arquivo e clicar em **Send Request** em cada um dos cenários pré-configurados (sucesso, erros de validação e regras de negócio).

---

## 📄 Licença

Este projeto foi desenvolvido para fins de estudo e prática de arquitetura de software e APIs REST com Node.js e TypeScript.
