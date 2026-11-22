import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryProductRepository } from './product.repository.js'

describe('Product Repository (Unit Tests)', () => {
    let productRepository: InMemoryProductRepository

    // Antes de cada teste, cria um repositório novinho e vazio!
    beforeEach(() => {
        productRepository = new InMemoryProductRepository()
    })

    it('deve ser possível cadastrar um novo produto', async () => {
        const product = await productRepository.create({
            name: 'Clean Code',
            description: 'Livro sobre boas práticas',
            price: 100,
            categoryId: '123e4567-e89b-12d3-a456-426614174000',
            stockQuantity: 10,
        })

        expect(product.id).toBeDefined() // Verifica se gerou um ID (UUID)
        expect(product.isAvailable).toBe(true) // Verifica se ficou disponível
    })

    it('não deve permitir saída de estoque maior que o saldo atual', async () => {
        const product = await productRepository.create({
            name: 'Clean Code',
            description: 'Livro sobre boas práticas',
            price: 100,
            categoryId: '123e4567-e89b-12d3-a456-426614174000',
            stockQuantity: 5,
        })

        // Esperamos que tentar tirar 10 unidades (quando só tem 5) lance o erro:
        await expect(
            productRepository.updateStock(product.id, {
                type: 'OUT',
                quantity: 10,
                userId: '123e4567-e89b-12d3-a456-426614174000',
            }),
        ).rejects.toThrow('Estoque insuficiente para esta operação')
    })

    it('deve atualizar o saldo e a disponibilidade ao movimentar o estoque', async () => {
        const product = await productRepository.create({
            name: 'Clean Code',
            description: 'Livro sobre boas práticas',
            price: 100,
            categoryId: '123e4567-e89b-12d3-a456-426614174000',
            stockQuantity: 10,
        })

        const afterIn = await productRepository.updateStock(product.id, {
            type: 'IN',
            quantity: 5,
            userId: '123e4567-e89b-12d3-a456-426614174000',
        })

        expect(afterIn?.stockQuantity).toBe(15)

        const afterOut = await productRepository.updateStock(product.id, {
            type: 'OUT',
            quantity: 15,
            userId: '123e4567-e89b-12d3-a456-426614174000',
        })

        expect(afterOut?.stockQuantity).toBe(0)
        expect(afterOut?.isAvailable).toBe(false)
    })

    it('deve listar produtos respeitando a paginação', async () => {
        for (let i = 1; i <= 3; i++) {
            await productRepository.create({
                name: `Produto ${i}`,
                description: 'Descrição de teste',
                price: 100,
                categoryId: '123e4567-e89b-12d3-a456-426614174000',
                stockQuantity: 10,
            })
        }
        const page1 = await productRepository.findAll({ page: 1, limit: 2 })
        const page2 = await productRepository.findAll({ page: 2, limit: 2 })

        expect(page1).toHaveLength(2)
        expect(page2).toHaveLength(1)
    })
})