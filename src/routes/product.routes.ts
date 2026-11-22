import type { FastifyInstance } from 'fastify';
import { z } from 'zod'
import {
    type Product,
    type CreateProductDTO,
    type UpdateProductDTO,
    type UpdateStockDTO,
    type ListProductsQuery,
    listProductsQueriesSchema,
    createProductSchema,
    updateStockSchema,
    updateProductSchema
} from '../schemas/product.schema.js'
import { PrismaProductRepository } from '../repositories/prisma-product.repository.js'
import { verifyJwt } from '../middlewares/verify-jwt.js'
import { verifyUserRole } from '../middlewares/verify-user-role.js'

const productRepository = new PrismaProductRepository()

// Schema para validar se o parâmetro :id da URL é um UUID válido
const paramsSchema = z.object({
    id: z.string().uuid({ message: 'O ID informado na URL não é um UUID válido' }),
})

export async function productsRoutes(app: FastifyInstance) {
    /**
   * 1. GET /products -> Listar todos os produtos (com filtros opcionais)
   */
    app.get('/products', async (request, reply) => {
        // Valida os query params da URL (ex: ?genre=Drama&year=1972)
        const queryValidation = listProductsQueriesSchema.safeParse(request.query)

        if (!queryValidation.success) {
            return reply.status(400).send({
                message: 'Parâmetros de busca inválidos',
                errors: queryValidation.error.flatten().fieldErrors,
            })
        }

        const products = await productRepository.findAll(queryValidation.data)
        return reply.status(200).send(products)
    })
    /**
    * 2. GET /products/:id -> Buscar um único produto pelo ID
    */
    app.get('/products/:id', async (request, reply) => {
        const paramsValidation = paramsSchema.safeParse(request.params)

        if (!paramsValidation.success) {
            return reply.status(400).send({
                message: 'Parâmetros de busca inválidos',
                errors: paramsValidation.error.flatten().fieldErrors,
            })
        }

        const { id } = paramsValidation.data
        const product = await productRepository.findById(id)

        if (!product) {
            return reply.status(404).send({ message: 'Produto não encontrado' })
        }
        return reply.status(200).send(product)
    })
    /**
    * 3. POST /products -> Cadastrar um novo produto
    */
    app.post('/products', { onRequest: [verifyJwt, verifyUserRole('ADMIN')] }, async (request, reply) => {
        // Valida o corpo JSON (body) enviado na requisição
        const bodyValidation = createProductSchema.safeParse(request.body)

        if (!bodyValidation.success) {
            return reply.status(400).send({
                message: 'Dados inválidos para cadastro do produto',
                errors: bodyValidation.error.flatten().fieldErrors,
            })
        }

        const newProduct = await productRepository.create(bodyValidation.data)

        // 201 Created é o status padrão do HTTP para quando um recurso novo é criado
        return reply.status(201).send(newProduct)
    })

    /**
    * 4. PUT /products/:id -> Atualizar um produto existente
    */
    app.put('/products/:id', { onRequest: [verifyJwt, verifyUserRole('ADMIN')] }, async (request, reply) => {

        // Valida o ID da URL
        const paramsValidation = paramsSchema.safeParse(request.params)
        if (!paramsValidation.success) {
            return reply.status(400).send({
                message: 'Parâmetro de rota inválido',
                errors: paramsValidation.error.flatten().fieldErrors,
            })
        }

        // Valida o corpo da atualização
        const bodyValidation = updateProductSchema.safeParse(request.body)
        if (!bodyValidation.success) {
            return reply.status(400).send({
                message: 'Dados inválidos para cadastro do produto',
                errors: bodyValidation.error.flatten().fieldErrors,
            })
        }

        const { id } = paramsValidation.data
        const updatedProduct = await productRepository.update(id, bodyValidation.data)
        if (!updatedProduct) {
            return reply.status(404).send({ message: 'Produto não encontrado para atualização' })
        }
        return reply.status(200).send(updatedProduct)
    })

    /**
    * 5. PATCH /products/:id/stock -> Atualizar apenas o estoque (adicionar ou subtrair itens)
    */
    app.patch('/products/:id/stock', { onRequest: [verifyJwt] }, async (request, reply) => {

        const paramsValidation = paramsSchema.safeParse(request.params)
        if (!paramsValidation.success) {
            return reply.status(400).send({
                message: 'Parâmetro de rota inválido',
                errors: paramsValidation.error.flatten().fieldErrors,
            })
        }

        const bodyValidation = updateStockSchema.omit({ userId: true }).safeParse(request.body)
        if (!bodyValidation.success) {
            return reply.status(400).send({
                message: 'Dados inválidos para atualização de estoque',
                errors: bodyValidation.error.flatten().fieldErrors,
            })
        }

        const { id } = paramsValidation.data

        try {
            const updatedProduct = await productRepository.updateStock(id, {
                ...bodyValidation.data,
                userId: request.user.sub,
            })
            if (!updatedProduct) {
                return reply.status(404).send({ message: 'Produto não encontrado' })
            }
            return reply.status(200).send(updatedProduct)
        } catch (error) {
            // Captura o "throw new Error('Estoque insuficiente...')" do repositório
            return reply.status(400).send({
                message: (error as Error).message,
            })
        }
    })
    /**
    * 6. DELETE /products/:id -> Remover um produto
    */
    app.delete('/products/:id', { onRequest: [verifyJwt, verifyUserRole('ADMIN')] }, async (request, reply) => {
        // Valida o ID da URL
        const paramsValidation = paramsSchema.safeParse(request.params)
        if (!paramsValidation.success) {
            return reply.status(400).send({
                message: 'Parâmetro de rota inválido',
                errors: paramsValidation.error.flatten().fieldErrors,
            })
        }
        const { id } = paramsValidation.data
        const deleted = await productRepository.delete(id)

        if (!deleted) {
            return reply.status(404).send({ message: 'Produto não encontrado para exclusão' })
        }

        // 204 No Content: Deu tudo certo, e não precisa enviar corpo de resposta
        return reply.status(204).send();
    })
}