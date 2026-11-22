import type { FastifyInstance } from "fastify";
import { hash, compare } from 'bcryptjs'
import { registerUserSchema, loginSchema } from "../schemas/user.schema.js";
import { PrismaUserRepository } from "../repositories/prisma-user.repository.js";
const userRepository = new PrismaUserRepository()

export async function authRoutes(app: FastifyInstance) {
    app.post('/users', async (request, reply) => {
        const bodyValidation = registerUserSchema.safeParse(request.body)

        if (!bodyValidation.success) {
            return reply.status(400).send({
                message: 'Dados inválidos para cadastro do usuário',
                errors: bodyValidation.error.flatten().fieldErrors,
            })
        }

        const { name, email, password, role } = bodyValidation.data

        const existingUser = await userRepository.findByEmail(email)

        if (existingUser) {
            return reply.status(409).send({ message: 'E-mail já cadastrado' })
        }

        const passwordHash = await hash(password, 8)

        const newUser = await userRepository.create({
            name,
            email,
            passwordHash,
            role,
        })

        return reply.status(201).send({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
        })

    })
    app.post('/sessions', async (request, reply) => {
        const bodyValidation = loginSchema.safeParse(request.body)

        if (!bodyValidation.success) {
            return reply.status(400).send({
                message: 'Dados inválidos para login do usuário',
                errors: bodyValidation.error.flatten().fieldErrors,
            })
        }

        const { email, password } = bodyValidation.data

        const user = await userRepository.findByEmail(email)

        if (!user) {
            return reply.status(401).send({ message: 'E-mail ou senha inválidos' })
        }

        const isPasswordValid = await compare(password, user.passwordHash)

        if (!isPasswordValid) {
            return reply.status(401).send({ message: 'E-mail ou senha inválidos' })
        }

        const token = await reply.jwtSign(
            {
                sub: user.id,
                role: user.role,
            },
            {
                sign: {
                    sub: user.id,
                    expiresIn: '7d', // O token expira em 7 dias
                },
            },
        )

        return reply.status(200).send({ token })
    })
}