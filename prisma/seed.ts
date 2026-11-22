import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {

    await prisma.stockMovement.deleteMany()
    await prisma.product.deleteMany()
    await prisma.category.deleteMany()
    await prisma.supplier.deleteMany()
    await prisma.user.deleteMany()

    const passwordHash = await hash('123456', 8)

    const admin = await prisma.user.create({
        data: {
            name: 'Admin Sistema',
            email: 'admin@stock.com',
            passwordHash: passwordHash,
            role: 'ADMIN'
        }
    })

    const eletronicsCategory = await prisma.category.create({
        data: {
            name: 'Eletrônicos',
            description: 'Produtos e acessórios eletrônicos'
        },
    })

    const category = await prisma.category.createMany({
        data: [
            { name: 'Vestuário' },
            { name: 'Alimentos' },
            { name: 'Móveis' },
            { name: 'Livros' },
            { name: 'Outros' },
        ]
    })

    const supplier = await prisma.supplier.create({
        data: {
            name: "Distribuidora Tech Brasil",
            email: "contato@techbrasil.com",
            phone: "11999998888"
        }
    })

    const product = await prisma.product.createMany({
        data: [
            {
                name: "Teclado Gamer",
                description: "Teclado Gamer RGB",
                price: 100,
                stockQuantity: 15,
                categoryId: eletronicsCategory.id,
                supplierId: supplier.id
            },
        ]
    })

    console.log('Seed executado com sucesso!')
}
main()
    .then(async () => {
        console.log('🌱 Seed concluído com sucesso!')
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error('❌ Erro no seed:', e)
        await prisma.$disconnect()
        throw e
    })