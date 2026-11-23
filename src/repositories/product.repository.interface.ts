import type { Product, CreateProductDTO, UpdateProductDTO, UpdateStockDTO, ListProductsQuery, Category, StockMovement } from '../schemas/product.schema.js'

export interface IProductRepository {
    findAll(query?: ListProductsQuery): Promise<Product[]>

    findById(id: string): Promise<Product | null>

    create(data: CreateProductDTO): Promise<Product>

    update(id: string, data: UpdateProductDTO): Promise<Product | null>

    updateStock(id: string, data: UpdateStockDTO): Promise<Product | null>

    delete(id: string): Promise<boolean>

    findCategories(): Promise<Category[]>

    findMovementsByProductId(productId: string): Promise<StockMovement[]>
}