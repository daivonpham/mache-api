import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseService } from "src/common/base/services/base-service";
import { ErrorMessage } from "src/common/constants/err";
import { SortOrder } from "src/common/constants/interface";
import { Brand } from "src/modules/brand/entities/brand.entity";
import { Category } from "src/modules/category/entities/category.entity";
import { Media, MediaKind } from "src/modules/media/entities/media.entity";
import { In, Repository } from "typeorm";
import {
  CreateProductDto,
  ProductPriceSort,
  ProductQueryDto,
  UpdateProductDto,
} from "../constants/product.dto";
import {
  ProductGalleryItemResponse,
  ProductResponse,
  ProductShopeeClickCountResponse,
  ProductViewCountResponse,
} from "../constants/product.response";
import { ProductImage } from "../entities/product-image.entity";
import { Product } from "../entities/product.entity";

@Injectable()
export class ProductService extends BaseService<Product> {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
  ) {
    super(productRepository);
  }

  private mapGallery(images?: ProductImage[]): ProductGalleryItemResponse[] {
    if (!images?.length) return [];
    return [...images]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((row) => ({
        id: row.id,
        mediaId: row.mediaId,
        sortOrder: row.sortOrder,
        url: row.media.url,
        alt: row.media?.alt,
      }));
  }

  toResponse(product: Product): ProductResponse {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      categoryId: product.categoryId,
      categoryName: product.category?.name,
      brandId: product.brandId ?? null,
      brandName: product.brand?.name,
      shopeeUrl: product.shopeeUrl,
      specifications: product.specifications ?? [],
      isFeatured: product.isFeatured,
      hasDiscount: product.hasDiscount,
      discountPercent: product.hasDiscount
        ? (product.discountPercent ?? null)
        : null,
      price: product.price ?? null,
      seo: product.seo ?? null,
      isActive: product.isActive,
      inStock: product.inStock,
      thumbnailMediaId: product.thumbnailMediaId ?? null,
      thumbnailUrl: product.thumbnailMedia?.url ?? null,
      gallery: this.mapGallery(product.images),
      viewCount: product.viewCount ?? 0,
      shopeeClickCount: product.shopeeClickCount ?? 0,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  private productRelations = {
    thumbnailMedia: true,
    images: { media: true },
    category: true,
    brand: true,
  } as const;

  private async findWithGallery(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: this.productRelations,
    });
    if (!product) {
      throw new NotFoundException(ErrorMessage.PRODUCT_NOT_FOUND);
    }
    return product;
  }

  private async assertSlugUnique(
    slug?: string,
    excludeId?: number,
  ): Promise<void> {
    if (!slug) return;
    const existing = await this.productRepository.findOne({ where: { slug } });
    if (existing && existing.id !== excludeId) {
      throw new BadRequestException(ErrorMessage.PRODUCT_SLUG_ALREADY_EXISTS);
    }
  }

  private async assertSkuUnique(
    sku?: string,
    excludeId?: number,
  ): Promise<void> {
    if (!sku) return;
    const existing = await this.productRepository.findOne({ where: { sku } });
    if (existing && existing.id !== excludeId) {
      throw new BadRequestException(ErrorMessage.PRODUCT_SKU_ALREADY_EXISTS);
    }
  }

  private async assertCategoryExists(categoryId: number): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new BadRequestException(ErrorMessage.PRODUCT_CATEGORY_NOT_FOUND);
    }
  }

  private async assertBrandExists(brandId?: number | null): Promise<void> {
    if (brandId == null) return;
    const brand = await this.brandRepository.findOne({
      where: { id: brandId },
    });
    if (!brand) {
      throw new BadRequestException(ErrorMessage.PRODUCT_BRAND_NOT_FOUND);
    }
  }

  private async assertThumbnailMedia(
    thumbnailMediaId?: number | null,
  ): Promise<void> {
    if (thumbnailMediaId == null) return;
    const media = await this.mediaRepository.findOne({
      where: { id: thumbnailMediaId },
    });
    if (!media) {
      throw new BadRequestException(ErrorMessage.MEDIA_NOT_FOUND);
    }
    if (media.kind !== MediaKind.IMAGE) {
      throw new BadRequestException(ErrorMessage.PRODUCT_GALLERY_MUST_BE_IMAGE);
    }
  }

  private async assertGalleryMediaIds(mediaIds: number[]): Promise<void> {
    if (!mediaIds.length) return;
    const uniqueIds = [...new Set(mediaIds)];
    const mediaList = await this.mediaRepository.find({
      where: { id: In(uniqueIds) },
    });
    if (mediaList.length !== uniqueIds.length) {
      throw new BadRequestException(ErrorMessage.MEDIA_NOT_FOUND);
    }
    const invalid = mediaList.find((m) => m.kind !== MediaKind.IMAGE);
    if (invalid) {
      throw new BadRequestException(ErrorMessage.PRODUCT_GALLERY_MUST_BE_IMAGE);
    }
  }

  private normalizeDiscountFields(
    dto: CreateProductDto | UpdateProductDto,
  ): Partial<Product> {
    const hasDiscount = dto.hasDiscount ?? false;
    return {
      ...dto,
      hasDiscount,
      discountPercent: hasDiscount ? (dto.discountPercent ?? null) : null,
    };
  }

  private stripGalleryFromDto<T extends CreateProductDto | UpdateProductDto>(
    dto: T,
  ): { payload: Omit<T, "galleryMediaIds">; galleryMediaIds?: number[] } {
    const { galleryMediaIds, ...payload } = dto;
    return { payload, galleryMediaIds };
  }

  /** Xóa hết gallery cũ, ghi lại theo thứ tự mảng mediaIds */
  private async syncGallery(
    productId: number,
    mediaIds: number[],
  ): Promise<void> {
    await this.assertGalleryMediaIds(mediaIds);
    await this.productImageRepository.delete({ productId });
    if (!mediaIds.length) return;
    const rows = mediaIds.map((mediaId, index) =>
      this.productImageRepository.create({
        productId,
        mediaId,
        sortOrder: index,
      }),
    );
    await this.productImageRepository.save(rows);
  }

  async create(dto: CreateProductDto): Promise<ProductResponse> {
    await this.assertSlugUnique(dto.slug);
    await this.assertSkuUnique(dto.sku);
    await this.assertCategoryExists(dto.categoryId);
    await this.assertBrandExists(dto.brandId);

    await this.assertThumbnailMedia(dto.thumbnailMediaId);

    const { payload, galleryMediaIds } = this.stripGalleryFromDto(dto);
    if (galleryMediaIds?.length) {
      await this.assertGalleryMediaIds(galleryMediaIds);
    }

    const product = await this.productRepository.manager.transaction(
      async (manager) => {
        const saved = await manager.save(
          manager.create(Product, this.normalizeDiscountFields(payload)),
        );

        if (galleryMediaIds !== undefined) {
          await manager.delete(ProductImage, { productId: saved.id });
          if (galleryMediaIds.length > 0) {
            await manager.save(
              galleryMediaIds.map((mediaId, sortOrder) =>
                manager.create(ProductImage, {
                  productId: saved.id,
                  mediaId,
                  sortOrder,
                }),
              ),
            );
          }
        }

        return saved;
      },
    );

    return this.toResponse(await this.findWithGallery(product.id));
  }

  async findAll(dto: ProductQueryDto) {
    const priceOrder =
      dto.priceSort === ProductPriceSort.DESC ? SortOrder.DESC : SortOrder.ASC;

    const result = await this.getAllGeneric({
      filter: {
        categoryId: dto.categoryId,
        brandId: dto.brandId,
        isFeatured: dto.isFeatured,
        inStock: dto.inStock,
        isActive: dto.isActive,
        hasDiscount: dto.isDiscount,
      },
      search: dto.search,
      page: dto.page,
      limit: dto.limit,
      getAll: true,
      ...(dto.priceSort
        ? {
            orderByRaw: `NULLIF(regexp_replace(alias.price, '[^0-9.]', '', 'g'), '')::numeric`,
            sort: priceOrder,
          }
        : {}),
      relations: [
        "thumbnailMedia",
        "images",
        "images.media",
        "category",
        "brand",
      ],
      select: [
        "id",
        "name",
        "slug",
        "sku",
        "description",
        "thumbnailMediaId",
        "thumbnailMedia.url",
        "categoryId",
        "category.name",
        "brandId",
        "brand.name",
        "shopeeUrl",
        "isFeatured",
        "hasDiscount",
        "discountPercent",
        "price",
        "isActive",
        "inStock",
        "viewCount",
        "shopeeClickCount",
        "createdAt",
        "updatedAt",
        "images",
        "images.id",
        "images.mediaId",
        "images.sortOrder",
        "images.media.url",
        "images.media.alt",
      ],
    });
    return {
      ...result,
      data: result.data.map((row) => this.toResponse(row)),
    };
  }

  async findOne(id: number): Promise<ProductResponse> {
    return this.toResponse(await this.findWithGallery(id));
  }

  async findBySlug(slug: string): Promise<ProductResponse> {
    const product = await this.productRepository.findOne({
      where: { slug },
      relations: this.productRelations,
    });
    if (!product) {
      throw new NotFoundException(ErrorMessage.PRODUCT_NOT_FOUND);
    }
    return this.toResponse(product);
  }

  async update(id: number, dto: UpdateProductDto): Promise<ProductResponse> {
    await this.assertSlugUnique(dto.slug, id);
    await this.assertSkuUnique(dto.sku, id);
    if (dto.categoryId != null) {
      await this.assertCategoryExists(dto.categoryId);
    }
    if (dto.brandId !== undefined) {
      await this.assertBrandExists(dto.brandId);
    }

    const existing = await this.productRepository.findOne({ where: { id } });
    if (!existing) {
      throw new NotFoundException(ErrorMessage.PRODUCT_NOT_FOUND);
    }

    if (dto.thumbnailMediaId !== undefined) {
      await this.assertThumbnailMedia(dto.thumbnailMediaId);
    }

    const { payload, galleryMediaIds } = this.stripGalleryFromDto(dto);
    if (galleryMediaIds !== undefined) {
      await this.assertGalleryMediaIds(galleryMediaIds);
    }

    await this.productRepository.manager.transaction(async (manager) => {
      if (Object.keys(payload).length > 0) {
        await manager.update(
          Product,
          id,
          this.normalizeDiscountFields(payload),
        );
      }
      if (galleryMediaIds !== undefined) {
        await manager.delete(ProductImage, { productId: id });
        if (galleryMediaIds.length) {
          await manager.save(
            ProductImage,
            galleryMediaIds.map((mediaId, sortOrder) =>
              manager.create(ProductImage, {
                productId: id,
                mediaId,
                sortOrder,
              }),
            ),
          );
        }
      }
    });

    return this.toResponse(await this.findWithGallery(id));
  }

  async toggleInStock(id: number): Promise<ProductResponse> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(ErrorMessage.PRODUCT_NOT_FOUND);
    }
    await this.productRepository.update(id, { inStock: !product.inStock });
    return this.toResponse(await this.findWithGallery(id));
  }

  async toggleIsActive(id: number): Promise<ProductResponse> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(ErrorMessage.PRODUCT_NOT_FOUND);
    }
    await this.productRepository.update(id, { isActive: !product.isActive });
    return this.toResponse(await this.findWithGallery(id));
  }

  async trackView(id: number): Promise<ProductViewCountResponse> {
    const product = await this.productRepository.findOne({
      where: { id },
      select: ["id", "viewCount"],
    });
    if (!product) {
      throw new NotFoundException(ErrorMessage.PRODUCT_NOT_FOUND);
    }
    await this.productRepository.increment({ id }, "viewCount", 1);
    return { id, viewCount: product.viewCount + 1 };
  }

  async trackShopeeClick(id: number): Promise<ProductShopeeClickCountResponse> {
    const product = await this.productRepository.findOne({
      where: { id },
      select: ["id", "shopeeClickCount"],
    });
    if (!product) {
      throw new NotFoundException(ErrorMessage.PRODUCT_NOT_FOUND);
    }
    await this.productRepository.increment({ id }, "shopeeClickCount", 1);
    return { id, shopeeClickCount: product.shopeeClickCount + 1 };
  }

  async delete(id: number): Promise<void> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(ErrorMessage.PRODUCT_NOT_FOUND);
    }
    await this.productRepository.softDelete(id);
  }
}
