import '@fastify/jwt'

declare module '@fastify/jwt' {
    interface FastifyJWT {
        // O que passamos na hora de criar o token:
        payload: {
            sub: string
            role: 'ADMIN' | 'OPERATOR'
        }
        // O que fica disponível em request.user depois que o usuário está logado:
        user: {
            sub: string
            role: 'ADMIN' | 'OPERATOR'
        }
    }
}