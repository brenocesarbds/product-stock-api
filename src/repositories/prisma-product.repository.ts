import { prisma } from '../lib/prisma.js'
import type { IProductRepository } from './product.repository.interface.js'
import type { Product, CreateProductDTO, UpdateProductDTO, UpdateStockDTO, ListProductsQuery } from '../schemas/product.schema.js'

export class PrismaProductRepository implements IProductRepository {
    // Método auxiliar privado: converte o Decimal do Prisma para number do JS
    private formatProduct(product: any): Product {
        return {
            ...product,
            price: Number(product.price),
        }
    }

    // 1. Buscar pelo ID
    async findById(id: string): Promise<Product | null> {
        const product = await prisma.product.findUnique({
            where: { id },
        })
        if (!product) {
            return null
        }
        return this.formatProduct(product)
    }

    // 2. Criar um novo registro
    async create(data: CreateProductDTO): Promise<Product> {
        const newProduct = await prisma.product.create({
            data: {
                ...data,
                // Se isAvailable não vier preenchido, calcula com base no estoque
                isAvailable: data.isAvailable ?? (data.stockQuantity ?? 0) > 0,
            },
        })
        return this.formatProduct(newProduct)
    }

    // 3. Deletar pelo ID
    async delete(id: string): Promise<boolean> {
        // Primeiro verificamos se existe no banco
        const existingProduct = await prisma.product.findUnique({
            where: { id },
        })
        if (!existingProduct) {
            return false
        }
        await prisma.product.delete({
            where: { id },
        })
        return true
    }

    // 4. Listar todos (com filtros opcionais)
    async findAll(query?: ListProductsQuery): Promise<Product[]> {

        const page = query?.page ?? 1
        const limit = query?.limit ?? 10
        const skip = (page - 1) * limit

        const products = await prisma.product.findMany({
            where: {
                categoryId: query?.categoryId,
                price: {
                    gte: query?.minPrice, // gte = Maior ou igual (>= minPrice)
                    lte: query?.maxPrice, // lte = Menor ou igual (<= maxPrice)
                },
            },
            skip,
            take: limit,
        })
        // Como é uma lista (array), passamos cada item pelo formatProduct usando .map()
        return products.map((product) => this.formatProduct(product))
    }

    // 5. Atualizar registro existente
    async update(id: string, data: UpdateProductDTO): Promise<Product | null> {
        const existingProduct = await prisma.product.findUnique({
            where: { id },
        })

        if (!existingProduct) {
            return null
        }

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                ...data,
                isAvailable:
                    data.isAvailable ??
                    (data.stockQuantity !== undefined
                        ? data.stockQuantity > 0
                        : existingProduct.isAvailable),
            },
        })

        return this.formatProduct(updatedProduct)
    }

    // 6. Atualizar apenas o estoque
    async updateStock(id: string, data: UpdateStockDTO): Promise<Product | null> {
        const existingProduct = await prisma.product.findUnique({
            where: { id },
        })

        if (!existingProduct) {
            return null
        }

        const newStock =
            data.type === 'IN'
                ? existingProduct.stockQuantity + data.quantity
                : existingProduct.stockQuantity - data.quantity

        if (newStock < 0) {
            throw new Error('Estoque insuficiente para esta operação')
        }

        // $transaction executa as duas queries juntas (Tudo ou Nada!)
        const [updatedProduct] = await prisma.$transaction([
            // 1ª operação: atualiza o saldo do livro
            prisma.product.update({
                where: { id },
                data: {
                    stockQuantity: newStock,
                    isAvailable: newStock > 0,
                },
            }),
            // 2ª operação: cria o registro de auditoria na tabela stock_movements
            prisma.stockMovement.create({
                data: {
                    type: data.type,
                    quantity: data.quantity,
                    reason: data.reason,
                    productId: id, // No seu projeto o campo se chama productId!
                    userId: data.userId,
                },
            }),
        ])
        return this.formatProduct(updatedProduct)
    }
}

