import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { app } from '../app.js'

describe('Product & Auth Routes (E2E Tests)', () => {
    // Aguarda o Fastify registrar JWT, Swagger e Rotas antes de começar
    beforeAll(async () => {
        await app.ready()
    })

    // Encerra o Fastify quando os testes terminarem
    afterAll(async () => {
        await app.close()
    })

    // Teste 1: Rota pública de healthcheck / listagem
    it('deve retornar status 200 ao listar produtos (GET /products)', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/products',
        })

        expect(response.statusCode).toBe(200)
        expect(Array.isArray(response.json())).toBe(true)
    })

    // Teste 2: Segurança JWT (tentar criar produto sem enviar Token)
    it('deve bloquear com status 401 ao tentar criar produto sem token JWT', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/products',
            payload: {
                name: 'Mouse sem fio',
                description: 'Mouse óptico ergonômico',
                price: 120,
                categoryId: '123e4567-e89b-12d3-a456-426614174000',
            },
        })

        expect(response.statusCode).toBe(401)
    })

    // Teste 3: Segurança RBAC (usuário OPERATOR tentando acessar rota exclusiva de ADMIN)
    it('deve bloquear com status 403 quando um OPERATOR tentar deletar um produto', async () => {
        // Criamos um token de um usuário com cargo OPERATOR
        const operatorToken = app.jwt.sign({
            sub: '123e4567-e89b-12d3-a456-426614174000',
            role: 'OPERATOR',
        })

        const response = await app.inject({
            method: 'DELETE',
            url: '/products/123e4567-e89b-12d3-a456-426614174000',
            headers: {
                Authorization: `Bearer ${operatorToken}`,
            },
        })

        expect(response.statusCode).toBe(403)
    })
}) 