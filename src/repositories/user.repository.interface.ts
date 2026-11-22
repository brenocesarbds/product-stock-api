import type { User } from '../schemas/user.schema.js'

export type CreateUserInput = {
    name: string
    email: string
    passwordHash: string
    role?: 'ADMIN' | 'OPERATOR'
}

export interface IUserRepository {
    findByEmail(email: string): Promise<User | null>

    findById(id: string): Promise<User | null>

    create(data: CreateUserInput): Promise<User>
}