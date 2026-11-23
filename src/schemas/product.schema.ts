import { z } from 'zod'

// 1. Schema completo de um Produto cadastrado
export const productSchema = z.object({
  id: z.string().uuid({ message: 'ID deve ser um UUID válido' }),
  name: z.string().min(2, 'O nome não pode ser vazio'),
  description: z.string().min(5, 'A descrição não pode ser vazia'),
  price: z.number().positive('Preço inválido'),
  categoryId: z.string().uuid({ message: 'categoryId deve ser um UUID válido' }),
  supplierId: z.string().uuid({ message: 'supplierId deve ser um UUID válido' }).nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  stockQuantity: z.number().int().min(0, 'Quantidade Inválida'),
  isAvailable: z.boolean(),
})

// 2. Schema para CRIAR um produto: não exigimos o 'id', pois o servidor cria sozinho
export const createProductSchema = productSchema
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    stockQuantity: z.number().int().min(0, 'Quantidade Inválida').optional(),
    isAvailable: z.boolean().optional(),
  })

// 3. Schema para ATUALIZAR um produto: todos os campos são opcionais (o usuário atualiza só o que quiser)
export const updateProductSchema = createProductSchema.partial()

// 4. Schema para ATUALIZAR o estoque:
export const updateStockSchema = z.object({
  type: z.enum(['IN', 'OUT'], {
    message: "O tipo de movimentação deve ser 'IN' (entrada) ou 'OUT' (saída)",
  }),
  quantity: z
    .number({ message: 'A quantidade deve ser um número' })
    .int('A quantidade deve ser um número inteiro')
    .positive('A quantidade deve ser maior que zero'),
  reason: z.string().min(3, 'O motivo deve ter pelo menos 3 caracteres').optional(),
  userId: z.string().uuid({ message: 'userId deve ser um UUID válido' }),
})

// 5. Schema para filtrar produtos na listagem via Query Params (ex: ?category=Móveis&price=2024)
export const listProductsQueriesSchema = z.object({
  categoryId: z.string().uuid().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
})

// 6. Tipos inferidos automaticamente pelo Zod:
export type Product = z.infer<typeof productSchema>
export type CreateProductDTO = z.infer<typeof createProductSchema>
export type UpdateProductDTO = z.infer<typeof updateProductSchema>
export type UpdateStockDTO = z.infer<typeof updateStockSchema>
export type ListProductsQuery = z.infer<typeof listProductsQueriesSchema>

export type Category = {
  id: string
  name: string
  description: string | null
  createdAt?: Date
}

export type StockMovement = {
  id: string
  type: 'IN' | 'OUT'
  quantity: number
  reason: string | null
  productId: string
  userId: string
  createdAt?: Date
}