import { z } from 'zod'

export const ROLES = ['ADMIN', 'OPERATOR'] as const

// 1. Schema da entidade User no banco
export const userSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('E-mail inválido'),
    passwordHash: z.string(),
    role: z.enum(ROLES),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
})

// 2. Schema para CADASTRAR usuário (POST /users)
export const registerUserSchema = z.object({
    name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    role: z.enum(ROLES).optional().default('OPERATOR'),
})

// 3. Schema para LOGIN (POST /sessions)
export const loginSchema = z.object({
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
})

export type User = z.infer<typeof userSchema>
export type RegisterUserDTO = z.infer<typeof registerUserSchema>
export type LoginDTO = z.infer<typeof loginSchema>