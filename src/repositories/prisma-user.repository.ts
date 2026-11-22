import { prisma } from '../lib/prisma.js'
import type { CreateUserInput, IUserRepository } from './user.repository.interface.js'
import type { User, RegisterUserDTO, LoginDTO } from '../schemas/user.schema.js'

export class PrismaUserRepository implements IUserRepository {

    // 1. Buscar pelo email
    async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email },
        })
    }

    // 2. Buscar pelo id
    async findById(id: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id },
        })
    }

    // 3. Criar um novo registro
    async create(data: CreateUserInput): Promise<User> {
        return prisma.user.create({
            data,
        })
    }
}

