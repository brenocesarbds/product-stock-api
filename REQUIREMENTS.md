# 📦 Desafio Técnico: product-stock-api

Uma API REST desenvolvida em **Node.js**, **Fastify**, **TypeScript** e **Zod** para gerenciamento de catálogo e controle de estoque de produtos, seguindo boas práticas de arquitetura em camadas (Repository Pattern).

---

## 🎯 Entidade: Produto (`Product`)

- `id`: string (UUID gerado automaticamente pelo servidor)
- `name`: string (mínimo 2 caracteres)
- `description`: string (mínimo 5 caracteres)
- `price`: number (positivo, > 0)
- `category`: Enum restrito:
  - `'Eletrônicos'`
  - `'Vestuário'`
  - `'Alimentos'`
  - `'Móveis'`
  - `'Livros'`
  - `'Outros'`
- `stockQuantity`: number (inteiro >= 0)
- `isAvailable`: boolean (opcional no cadastro; padrão calculado `stockQuantity > 0`)

---

## 🌐 Rotas HTTP (CRUD + Regras de Negócio)

| Método | Rota | Descrição | Status Sucesso |
| :--- | :--- | :--- | :--- |
| **`GET`** | `/products` | Listar produtos com filtros opcionais (`category`, `minPrice`, `maxPrice`) | `200 OK` |
| **`GET`** | `/products/:id` | Buscar um produto específico por ID | `200 OK` ou `404` |
| **`POST`** | `/products` | Cadastrar novo produto com validação Zod | `201 Created` |
| **`PUT`** | `/products/:id` | Atualizar dados do produto | `200 OK` ou `404` |
| **`PATCH`** | `/products/:id/stock` | Atualizar apenas o estoque (adicionar ou subtrair itens) | `200 OK` ou `400` / `404` |
| **`DELETE`** | `/products/:id` | Remover produto do catálogo | `204 No Content` ou `404` |

---

## 🏗️ Estrutura Esperada de Pastas

```text
product-stock-api/
├── src/
│   ├── schemas/
│   │   └── product.schema.ts
│   ├── repositories/
│   │   └── product.repository.ts
│   ├── routes/
│   │   └── product.routes.ts
│   └── server.ts
├── client.http
├── package.json
├── tsconfig.json
└── REQUIREMENTS.md
```

---

## 👨‍💻 Modo de Trabalho: Mentoria / Code Review
- O aluno desenvolve o código de forma independente.
- O assistente atua como revisor técnico (Code Review), validando schemas, tipos, regras de negócio e boas práticas.

