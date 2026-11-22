import fastify from 'fastify'
import 'dotenv/config'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { authRoutes } from './routes/auth.routes.js'
import { productsRoutes } from './routes/product.routes.js'

export const app = fastify({
    logger: true,
})

// 1. Configura a especificação OpenAPI (Swagger)
app.register(fastifySwagger, {
    openapi: {
        info: {
            title: 'Product Stock API',
            description: 'API REST para catálogo e controle de estoque de produtos',
            version: '1.0.0',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
})

// 2. Disponibiliza a interface visual interativa na rota /docs
app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
})

// 3. Configura o JWT
app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'default-dev-secret',
})

// 4. Registra as rotas
app.register(authRoutes)
app.register(productsRoutes)

app.get('/ping', async (request, reply) => {
    return reply.status(200).send({ message: 'API de Produtos ativa!' })
})