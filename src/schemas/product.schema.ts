import { z } from 'zod'

// 1 Lista de Categorias permitidas
export const CATEGORIES = [
  'Eletrônicos',
  'Vestuário',
  'Alimentos',
  'Móveis',
  'Livros',
  'Outros',
] as const

// 2. Schema completo de um Produto cadastrado
export const productSchema = z.object({
  id: z.string().uuid({ message: 'ID deve ser um UUID válido' }),
  name: z.string().min(2, 'O nome não pode ser vazio'),
  description: z.string().min(5, 'A descrição não pode ser vazia'),
  price: z.number().positive('Preço inválido'),
  category: z.enum(CATEGORIES, { message: 'Categoria inválida' }),
  stockQuantity: z.number().int().min(0, 'Quantidade Inválida'),
  isAvailable: z.boolean(),
})

// 3. Schema para CRIAR um produto: não exigimos o 'id', pois o servidor cria sozinho
export const createProductSchema = productSchema
  .omit({ id: true })
  .extend({
    isAvailable: z.boolean().optional(),
  })

// 4. Schema para ATUALIZAR um produto: todos os campos são opcionais (o usuário atualiza só o que quiser)
export const updateProductSchema = createProductSchema.partial()

// 5. Schema para ATUALIZAR o estoque:
// 5. Schema para ATUALIZAR o estoque:
export const updateStockSchema = z.object({
  quantity: z
    .number({ message: 'A quantidade deve ser um número' })
    .int('A quantidade deve ser um número inteiro')
    .refine((val) => val !== 0, {
      message: 'A quantidade deve ser diferente de zero (positiva para entrada ou negativa para saída)',
    }),
})

// 6. Schema para filtrar produtos na listagem via Query Params (ex: ?category=Móveis&price=2024)
export const listProductsQueriesSchema = z.object({
  category: z.enum(CATEGORIES).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
})

// 6. Tipos inferidos automaticamente pelo Zod:
export type Product = z.infer<typeof productSchema>
export type CreateProductDTO = z.infer<typeof createProductSchema>
export type UpdateProductDTO = z.infer<typeof updateProductSchema>
export type UpdateStockDTO = z.infer<typeof updateStockSchema>
export type ListProductsQuery = z.infer<typeof listProductsQueriesSchema>