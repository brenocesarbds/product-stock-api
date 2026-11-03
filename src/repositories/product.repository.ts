import { randomUUID } from 'node:crypto';
import type {
    Product,
    CreateProductDTO,
    UpdateProductDTO,
    UpdateStockDTO,
    ListProductsQuery
} from '../schemas/product.schema.js'

// Nossa "tabela" em memória. Tem 2 produtos pré-cadastrados para facilitar os testes
const products: Product[] = [
    {
        id: randomUUID(),
        name: 'Teclado Mecânico RGB',
        description: 'Teclado mecânico compacto com switches azuis e iluminação LED',
        price: 250.00,
        category: 'Eletrônicos',
        stockQuantity: 15,
        isAvailable: true,
    },
    {
        id: randomUUID(),
        name: 'O Programador Pragmático',
        description: 'Guia prático sobre boas práticas na engenharia de software',
        price: 89.90,
        category: 'Livros',
        stockQuantity: 0,
        isAvailable: false,
    },
    {
        id: randomUUID(),
        name: 'Cadeira de Escritório Ergonômica',
        description: 'Cadeira giratória com suporte lombar e ajuste de altura',
        price: 650.00,
        category: 'Móveis',
        stockQuantity: 5,
        isAvailable: true,
    },
]


export const productRepository = {
    /**
    * 1. Lista produtos, aplicando filtros opcionais se fornecidos
    */
    findAll(query?: ListProductsQuery): Product[] {
        let result = [...products]

        if (!query) {
            return result
        }

        const { category, minPrice, maxPrice } = query

        if (category) {
            result = result.filter((product) => product.category === query.category)
        }

        if (minPrice !== undefined) {
            result = result.filter((product) => product.price >= minPrice)
        }

        if (maxPrice !== undefined) {
            result = result.filter((product) => product.price <= maxPrice)
        }

        return result
    },
    /**
    * 2. Busca um produto pelo ID
    */
    findByID(id: string): Product | undefined {
        return products.find((product) => product.id === id)
    },

    /**
   * 3. Cria um novo produto gerando o UUID automaticamente
   */
    create(data: CreateProductDTO): Product {
        const newProduct: Product = {
            id: randomUUID(),
            ...data,
            isAvailable: data.isAvailable ?? data.stockQuantity > 0,
        }

        products.push(newProduct)
        return newProduct
    },

    /**
    * 4. Atualiza os dados de um produto existente. Retorna null se não encontrar.
    */
    update(id: string, data: UpdateProductDTO): Product | null {
        const index = products.findIndex((product) => product.id === id)
        if (index === -1) {
            return null
        }

        // Mescla os dados antigos com os novos que o usuário enviou
        const updatedProduct: Product = {
            ...products[index],
            ...data,
                isAvailable: data.isAvailable ??
                (data.stockQuantity !== undefined
                    ? data.stockQuantity > 0
                    : products[index].isAvailable
                ),
        }

        products[index] = updatedProduct
        return updatedProduct
    },

    /**
* 5. Atualiza apenas o estoque (adicionar ou subtrair itens).
*/
    updateStock(id: string, quantity: number): Product | null {
        const index = products.findIndex((product) => product.id === id)
        if (index === -1) {
            return null
        }

        const newStock = products[index].stockQuantity + quantity
        if (newStock < 0) {
            throw new Error('Estoque insuficiente para esta operação')
        }

        products[index].stockQuantity = newStock
        products[index].isAvailable = newStock > 0
        return products[index]
    },

    /**
    * 6. Remove um produto pelo ID. Retorna true se removeu, false se não encontrou.
    */
    delete(id: string): boolean {
        const index = products.findIndex((product) => product.id === id)
        if (index === -1) {
            return false
        }
        products.splice(index, 1)
        return true
    },
}