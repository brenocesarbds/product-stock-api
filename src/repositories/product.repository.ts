import { randomUUID } from 'node:crypto';
import type {
    Product,
    CreateProductDTO,
    UpdateProductDTO,
    UpdateStockDTO,
    ListProductsQuery
} from '../schemas/product.schema.js'

import type { IProductRepository } from './product.repository.interface.js'

export class InMemoryProductRepository implements IProductRepository {
    private products: Product[] = []

    /**
    * 1. Lista produtos, aplicando filtros opcionais se fornecidos
    */
    async findAll(query?: ListProductsQuery): Promise<Product[]> {
        let result = [...this.products]

        if (!query) {
            return result
        }

        const { categoryId, minPrice, maxPrice } = query

        if (categoryId) {
            result = result.filter((product) => product.categoryId === query.categoryId)
        }

        if (minPrice !== undefined) {
            result = result.filter((product) => product.price >= minPrice)
        }

        if (maxPrice !== undefined) {
            result = result.filter((product) => product.price <= maxPrice)
        }

        const page = query.page ?? 1
        const limit = query.limit ?? 10
        const skip = (page - 1) * limit

        return result.slice(skip, skip + limit)
    }
    /**
    * 2. Busca um produto pelo ID
    */
    async findById(id: string): Promise<Product | null> {
        return this.products.find((product) => product.id === id) ?? null
    }

    /**
   * 3. Cria um novo produto gerando o UUID automaticamente
   */
    async create(data: CreateProductDTO): Promise<Product> {
        const stockQuantity = data.stockQuantity ?? 0
        const newProduct: Product = {
            id: randomUUID(),
            ...data,
            stockQuantity,
            isAvailable: data.isAvailable ?? stockQuantity > 0,
        }
        this.products.push(newProduct)
        return newProduct
    }

    /**
    * 4. Atualiza os dados de um produto existente. Retorna null se não encontrar.
    */
    async update(id: string, data: UpdateProductDTO): Promise<Product | null> {
        const index = this.products.findIndex((product) => product.id === id)
        if (index === -1) {
            return null
        }

        // Mescla os dados antigos com os novos que o usuário enviou
        const updatedProduct: Product = {
            ...this.products[index],
            ...data,
            isAvailable: data.isAvailable ??
                (data.stockQuantity !== undefined
                    ? data.stockQuantity > 0
                    : this.products[index].isAvailable
                ),
        }

        this.products[index] = updatedProduct
        return updatedProduct
    }

    /**
* 5. Atualiza apenas o estoque (adicionar ou subtrair itens).
*/
    async updateStock(id: string, data: UpdateStockDTO): Promise<Product | null> {
        const index = this.products.findIndex((product) => product.id === id)
        if (index === -1) {
            return null
        }
        const newStock =
            data.type === 'IN'
                ? this.products[index].stockQuantity + data.quantity
                : this.products[index].stockQuantity - data.quantity
        if (newStock < 0) {
            throw new Error('Estoque insuficiente para esta operação')
        }

        this.products[index].stockQuantity = newStock
        this.products[index].isAvailable = newStock > 0
        return this.products[index]
    }

    /**
    * 6. Remove um produto pelo ID. Retorna true se removeu, false se não encontrou.
    */
    async delete(id: string): Promise<boolean> {
        const index = this.products.findIndex((product) => product.id === id)
        if (index === -1) {
            return false
        }
        this.products.splice(index, 1)
        return true
    }
}