import { AppDataSource } from '../../database/data-source';
import { Product } from '../../database/entities/product.entity';
import { Category } from '../../database/entities/category.entity';
import { Supplier } from '../../database/entities/supplier.entity';
import { ProductVariant } from '../../database/entities/product-variant.entity';
import { ProductBatch } from '../../database/entities/product-batch.entity';
import { StockLocation } from '../../database/entities/stock-location.entity';
import { buildPaginated, toPagination, PaginationOptions } from '../common/pagination';
import {
  productSchema,
  updateProductSchema,
  categorySchema,
  supplierSchema,
  stockLocationSchema
} from './inventory.schemas';

export class InventoryService {
  private productRepository = AppDataSource.getRepository(Product);
  private variantRepository = AppDataSource.getRepository(ProductVariant);
  private batchRepository = AppDataSource.getRepository(ProductBatch);
  private categoryRepository = AppDataSource.getRepository(Category);
  private supplierRepository = AppDataSource.getRepository(Supplier);
  private stockLocationRepository = AppDataSource.getRepository(StockLocation);

  async listProducts(tenantId: string, options: PaginationOptions = {}, search?: string) {
    const pagination = toPagination(options);
    const query = this.productRepository
      .createQueryBuilder('product')
      .where('product.tenantId = :tenantId', { tenantId })
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.supplier', 'supplier')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('product.batches', 'batches')
      .skip((pagination.page - 1) * pagination.limit)
      .take(pagination.limit)
      .orderBy('product.updatedAt', 'DESC');

    if (search) {
      query.andWhere(
        '(product.name ILIKE :search OR product.sku ILIKE :search OR product.barcode ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [data, total] = await query.getManyAndCount();
    return buildPaginated(data, total, pagination);
  }

  async createProduct(tenantId: string, branchId: string | null, payload: unknown) {
    const parsed = productSchema.parse(payload);
    const product = this.productRepository.create({
      tenantId,
      branchId,
      sku: parsed.sku,
      barcode: parsed.barcode ?? null,
      name: parsed.name,
      description: parsed.description ?? null,
      costPrice: parsed.costPrice.toFixed(4),
      salePrice: parsed.salePrice.toFixed(4),
      taxRate: parsed.taxRate.toFixed(4),
      reorderPoint: parsed.reorderPoint.toFixed(4),
      isVariantParent: Boolean(parsed.variants?.length),
      unit: parsed.unit,
      supplierId: parsed.supplierId ?? null,
      categoryId: parsed.categoryId ?? null,
      isBatchTracked: parsed.isBatchTracked,
      expiryTracking: parsed.expiryTracking,
      syncState: 'pending'
    });

    const savedProduct = await this.productRepository.save(product);

    if (parsed.variants?.length) {
      const variants = parsed.variants.map((variant) =>
        this.variantRepository.create({
          tenantId,
          branchId,
          parent: savedProduct,
          name: variant.name,
          sku: variant.sku,
          barcode: variant.barcode ?? null,
          attributes: variant.attributes ?? {},
          salePrice: variant.salePrice.toFixed(4),
          costPrice: variant.costPrice.toFixed(4),
          currentStock: '0',
          syncState: 'pending'
        })
      );
      await this.variantRepository.save(variants);
    }

    if (parsed.batches?.length) {
      const batches = parsed.batches.map((batch) =>
        this.batchRepository.create({
          tenantId,
          branchId,
          product: savedProduct,
          batchCode: batch.batchCode,
          manufacturedAt: batch.manufacturedAt ? new Date(batch.manufacturedAt) : null,
          expiresAt: batch.expiresAt ? new Date(batch.expiresAt) : null,
          quantity: batch.quantity.toFixed(4),
          remainingQuantity: batch.quantity.toFixed(4),
          syncState: 'pending'
        })
      );
      await this.batchRepository.save(batches);
    }

    return this.getProductById(tenantId, savedProduct.id);
  }

  async getProductById(tenantId: string, id: string) {
    const product = await this.productRepository.findOne({
      where: { id, tenantId },
      relations: ['category', 'supplier', 'variants', 'batches']
    });
    if (!product) {
      throw Object.assign(new Error('Product not found'), { status: 404 });
    }
    return product;
  }

  async updateProduct(tenantId: string, id: string, payload: unknown) {
    const parsed = updateProductSchema.parse(payload);
    const product = await this.productRepository.findOne({
      where: { id, tenantId },
      relations: ['variants', 'batches']
    });
    if (!product) {
      throw Object.assign(new Error('Product not found'), { status: 404 });
    }

    Object.assign(product, {
      sku: parsed.sku ?? product.sku,
      barcode: parsed.barcode ?? product.barcode,
      name: parsed.name ?? product.name,
      description: parsed.description ?? product.description,
      costPrice:
        parsed.costPrice !== undefined ? parsed.costPrice.toFixed(4) : product.costPrice,
      salePrice:
        parsed.salePrice !== undefined ? parsed.salePrice.toFixed(4) : product.salePrice,
      taxRate: parsed.taxRate !== undefined ? parsed.taxRate.toFixed(4) : product.taxRate,
      reorderPoint:
        parsed.reorderPoint !== undefined ? parsed.reorderPoint.toFixed(4) : product.reorderPoint,
      unit: parsed.unit ?? product.unit,
      supplierId: parsed.supplierId ?? product.supplierId,
      categoryId: parsed.categoryId ?? product.categoryId,
      isBatchTracked: parsed.isBatchTracked ?? product.isBatchTracked,
      expiryTracking: parsed.expiryTracking ?? product.expiryTracking,
      syncState: 'pending'
    });

    if (parsed.variants) {
      await this.variantRepository.delete({ tenantId, parent: { id: product.id } });
      const variants = parsed.variants.map((variant) =>
        this.variantRepository.create({
          tenantId,
          branchId: product.branchId,
          parent: product,
          name: variant.name,
          sku: variant.sku,
          barcode: variant.barcode ?? null,
          attributes: variant.attributes ?? {},
          salePrice: variant.salePrice.toFixed(4),
          costPrice: variant.costPrice.toFixed(4),
          currentStock: '0',
          syncState: 'pending'
        })
      );
      await this.variantRepository.save(variants);
      product.isVariantParent = variants.length > 0;
    }

    if (parsed.batches) {
      await this.batchRepository.delete({ tenantId, product: { id: product.id } });
      const batches = parsed.batches.map((batch) =>
        this.batchRepository.create({
          tenantId,
          branchId: product.branchId,
          product,
          batchCode: batch.batchCode,
          manufacturedAt: batch.manufacturedAt ? new Date(batch.manufacturedAt) : null,
          expiresAt: batch.expiresAt ? new Date(batch.expiresAt) : null,
          quantity: batch.quantity.toFixed(4),
          remainingQuantity: batch.quantity.toFixed(4),
          syncState: 'pending'
        })
      );
      await this.batchRepository.save(batches);
    }

    await this.productRepository.save(product);
    return this.getProductById(tenantId, id);
  }

  async removeProduct(tenantId: string, id: string) {
    const product = await this.productRepository.findOne({ where: { id, tenantId } });
    if (!product) {
      throw Object.assign(new Error('Product not found'), { status: 404 });
    }
    await this.productRepository.remove(product);
    return { id };
  }

  async listCategories(tenantId: string) {
    return this.categoryRepository.find({
      where: { tenantId },
      relations: ['children'],
      order: { name: 'ASC' }
    });
  }

  async createCategory(tenantId: string, branchId: string | null, payload: unknown) {
    const parsed = categorySchema.parse(payload);
    const parent = parsed.parentId
      ? await this.categoryRepository.findOne({ where: { id: parsed.parentId, tenantId } })
      : null;
    const category = this.categoryRepository.create({
      tenantId,
      branchId,
      name: parsed.name,
      description: parsed.description ?? null,
      parent: parent ?? null,
      syncState: 'pending'
    });
    return this.categoryRepository.save(category);
  }

  async listSuppliers(tenantId: string) {
    return this.supplierRepository.find({ where: { tenantId }, order: { name: 'ASC' } });
  }

  async createSupplier(tenantId: string, branchId: string | null, payload: unknown) {
    const parsed = supplierSchema.parse(payload);
    const supplier = this.supplierRepository.create({
      tenantId,
      branchId,
      name: parsed.name,
      contactName: parsed.contactName ?? null,
      email: parsed.email ?? null,
      phone: parsed.phone ?? null,
      address: parsed.address ?? null,
      taxNumber: parsed.taxNumber ?? null,
      syncState: 'pending'
    });
    return this.supplierRepository.save(supplier);
  }

  async listStockLocations(tenantId: string, branchId?: string | null) {
    const where: Record<string, unknown> = { tenantId };
    if (branchId) where.branchId = branchId;
    return this.stockLocationRepository.find({ where, order: { name: 'ASC' } });
  }

  async createStockLocation(tenantId: string, branchId: string | null, payload: unknown) {
    const parsed = stockLocationSchema.parse(payload);
    const location = this.stockLocationRepository.create({
      tenantId,
      branchId: parsed.branchId ?? branchId,
      name: parsed.name,
      description: parsed.description ?? null,
      isDefault: parsed.isDefault ?? false,
      syncState: 'pending'
    });

    if (location.isDefault) {
      await this.stockLocationRepository.update(
        { tenantId, branchId: location.branchId },
        { isDefault: false }
      );
    }

    return this.stockLocationRepository.save(location);
  }

  async bulkImportProducts(
    tenantId: string,
    branchId: string | null,
    rows: Array<Record<string, string | number>>
  ) {
    const createdProducts = [];
    for (const row of rows) {
      const payload = productSchema.safeParse({
        sku: row.sku,
        barcode: row.barcode,
        name: row.name,
        description: row.description,
        costPrice: Number(row.costPrice ?? 0),
        salePrice: Number(row.salePrice ?? 0),
        taxRate: Number(row.taxRate ?? 0),
        reorderPoint: Number(row.reorderPoint ?? 0),
        unit: row.unit ?? 'unit',
        categoryId: row.categoryId,
        supplierId: row.supplierId
      });
      if (!payload.success) {
        // skip invalid rows
        continue;
      }
      const product = await this.createProduct(tenantId, branchId, payload.data);
      createdProducts.push(product);
    }
    return createdProducts;
  }

  async exportProducts(tenantId: string) {
    const products = await this.productRepository.find({
      where: { tenantId },
      relations: ['category', 'supplier']
    });
    const header =
      'SKU,Barcode,Name,Description,Cost Price,Sale Price,Tax Rate,Reorder Point,Category,Supplier';
    const lines = products.map((product) =>
      [
        product.sku,
        product.barcode ?? '',
        product.name,
        product.description ?? '',
        product.costPrice,
        product.salePrice,
        product.taxRate,
        product.reorderPoint,
        product.category?.name ?? '',
        product.supplier?.name ?? ''
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(',')
    );
    return [header, ...lines].join('\n');
  }
}
