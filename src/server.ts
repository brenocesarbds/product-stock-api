import fastify from "fastify";
import { productsRoutes } from "./routes/product.routes.js";

// 1. Instanciamos o Fastify
const app = fastify({
    logger: true, // Liga logs automáticos e coloridos no terminal
});

// 2. Registramos as rotas de produtos
app.register(productsRoutes);

// 3. Rota de verificação de integridade (Health Check)
app.get('/ping', async (request, reply) => {
    return reply.status(200).send({ message: 'API de Produtos ativa!' });
});

// 4. Colocamos o servidor para ouvir conexões na porta 3333
const start = async () => {
    try {
        await app.listen({ port: 3333, host: '0.0.0.0' });
        console.log('Servidor rodando em http://localhost:3333');
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();