import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseService } from "src/common/base/services/base-service";
import { ErrorMessage } from "src/common/constants/err";
import { Product } from "src/modules/product/entities/product.entity";
import { EntityManager, In, Repository } from "typeorm";
import {
  CreateProductReviewDto,
  PRODUCT_REVIEW_DEFAULT_SORT,
  PRODUCT_REVIEW_DEFAULT_SORT_BY,
  ProductReviewQueryDto,
  UpdateProductReviewDto,
} from "../constants/product-review.dto";
import {
  ProductReviewCategoryLinkResponse,
  ProductReviewProductLinkResponse,
  ProductReviewResponse,
} from "../constants/product-review.response";
import { ProductReviewCategory } from "../entities/product-review-category.entity";
import { ProductReviewProduct } from "../entities/product-review-product.entity";
import { ProductReview } from "../entities/product-review.entity";
import { ReviewCategory } from "../entities/review-category.entity";

type RelationIds = {
  productIds?: number[];
  categoryIds?: number[];
};

const REVIEW_RELATIONS = [
  "reviewProducts",
  "reviewProducts.product",
  "reviewCategories",
  "reviewCategories.category",
];

const REVIEW_SELECT = [
  "id",
  "title",
  "slug",
  "description",
  "youtubeUrl",
  "seo",
  "createdAt",
  "updatedAt",
  "reviewProducts",
  "reviewProducts.productId",
  "reviewProducts.sortOrder",
  "reviewProducts.product.id",
  "reviewProducts.product.name",
  "reviewProducts.product.slug",
  "reviewCategories",
  "reviewCategories.reviewCategoryId",
  "reviewCategories.category.id",
  "reviewCategories.category.name",
  "reviewCategories.category.slug",
];

@Injectable()
export class ProductReviewService extends BaseService<ProductReview> {
  constructor(
    @InjectRepository(ProductReview)
    private readonly productReviewRepository: Repository<ProductReview>,
    @InjectRepository(ProductReviewProduct)
    private readonly productReviewProductRepository: Repository<ProductReviewProduct>,
    @InjectRepository(ProductReviewCategory)
    private readonly productReviewCategoryRepository: Repository<ProductReviewCategory>,
    @InjectRepository(ReviewCategory)
    private readonly reviewCategoryRepository: Repository<ReviewCategory>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {
    super(productReviewRepository);
  }

  private stripRelations<
    T extends CreateProductReviewDto | UpdateProductReviewDto,
  >(
    dto: T,
  ): {
    payload: Omit<T, "productIds" | "categoryIds">;
    relations: RelationIds;
  } {
    const { productIds, categoryIds, ...payload } = dto;
    return { payload, relations: { productIds, categoryIds } };
  }

  private assertUniqueIds(
    ids: number[],
    duplicateMessage: ErrorMessage,
  ): number[] {
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length !== ids.length) {
      throw new BadRequestException(duplicateMessage);
    }
    return uniqueIds;
  }

  private mapReviewProducts(
    links?: ProductReviewProduct[],
  ): ProductReviewProductLinkResponse[] {
    if (!links?.length) return [];
    return [...links]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((row) => ({
        productId: row.productId,
        sortOrder: row.sortOrder,
        product: row.product
          ? {
              id: row.product.id,
              name: row.product.name,
              slug: row.product.slug,
            }
          : undefined,
      }));
  }

  private mapReviewCategories(
    links?: ProductReviewCategory[],
  ): ProductReviewCategoryLinkResponse[] {
    if (!links?.length) return [];
    return links.map((row) => ({
      reviewCategoryId: row.reviewCategoryId,
      category: row.category
        ? {
            id: row.category.id,
            name: row.category.name,
            slug: row.category.slug,
          }
        : undefined,
    }));
  }

  toResponse(review: ProductReview): ProductReviewResponse {
    const reviewProducts = this.mapReviewProducts(review.reviewProducts);
    const reviewCategories = this.mapReviewCategories(review.reviewCategories);

    return {
      id: review.id,
      title: review.title,
      slug: review.slug,
      description: review.description ?? null,
      youtubeUrl: review.youtubeUrl ?? null,
      productIds: reviewProducts.map((row) => row.productId),
      categoryIds: reviewCategories.map((row) => row.reviewCategoryId),
      reviewProducts,
      reviewCategories,
      seo: review.seo ?? null,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }

  private async assertSlugUnique(
    slug?: string,
    excludeId?: number,
  ): Promise<void> {
    if (!slug) return;
    const existing = await this.productReviewRepository.findOne({
      where: { slug },
    });
    if (existing && existing.id !== excludeId) {
      throw new BadRequestException(ErrorMessage.SLUG_ALREADY_EXISTS);
    }
  }

  private async assertProducts(productIds?: number[]): Promise<void> {
    if (!productIds?.length) {
      throw new BadRequestException(
        ErrorMessage.PRODUCT_REVIEW_PRODUCT_IDS_REQUIRED,
      );
    }
    const uniqueIds = this.assertUniqueIds(
      productIds,
      ErrorMessage.PRODUCT_REVIEW_PRODUCT_IDS_DUPLICATE,
    );
    const found = await this.productRepository.find({
      where: { id: In(uniqueIds) },
    });
    if (found.length !== uniqueIds.length) {
      throw new NotFoundException(ErrorMessage.PRODUCT_NOT_FOUND);
    }
  }

  private async assertCategories(categoryIds?: number[]): Promise<void> {
    if (!categoryIds?.length) {
      throw new BadRequestException(
        ErrorMessage.PRODUCT_REVIEW_CATEGORY_IDS_REQUIRED,
      );
    }
    const uniqueIds = this.assertUniqueIds(
      categoryIds,
      ErrorMessage.PRODUCT_REVIEW_CATEGORY_IDS_DUPLICATE,
    );
    const found = await this.reviewCategoryRepository.find({
      where: { id: In(uniqueIds) },
    });
    if (found.length !== uniqueIds.length) {
      throw new NotFoundException(ErrorMessage.REVIEW_CATEGORY_NOT_FOUND);
    }
  }

  private async syncProducts(
    manager: EntityManager,
    reviewId: number,
    productIds: number[],
  ): Promise<void> {
    const repo = manager.getRepository(ProductReviewProduct);
    await repo.delete({ productReviewId: reviewId });
    if (!productIds.length) return;
    const rows = productIds.map((productId, sortOrder) =>
      repo.create({ productReviewId: reviewId, productId, sortOrder }),
    );
    await repo.save(rows);
  }

  private async syncCategories(
    manager: EntityManager,
    reviewId: number,
    categoryIds: number[],
  ): Promise<void> {
    const repo = manager.getRepository(ProductReviewCategory);
    await repo.delete({ productReviewId: reviewId });
    if (!categoryIds.length) return;
    const rows = categoryIds.map((reviewCategoryId) =>
      repo.create({ productReviewId: reviewId, reviewCategoryId }),
    );
    await repo.save(rows);
  }

  private async resolveFilteredReviewIds(
    dto: ProductReviewQueryDto,
  ): Promise<number[] | undefined> {
    let ids: number[] | undefined;

    if (dto.categoryId != null) {
      const rows = await this.productReviewCategoryRepository.find({
        where: { reviewCategoryId: dto.categoryId },
        select: ["productReviewId"],
      });
      ids = rows.map((row) => row.productReviewId);
      if (!ids.length) return [];
    }

    if (dto.productId != null) {
      const rows = await this.productReviewProductRepository.find({
        where: { productId: dto.productId },
        select: ["productReviewId"],
      });
      const productReviewIds = rows.map((row) => row.productReviewId);
      ids = ids
        ? ids.filter((id) => productReviewIds.includes(id))
        : productReviewIds;
      if (!ids.length) return [];
    }

    return ids;
  }

  private async findReviewOrThrow(
    where: { id: number } | { slug: string },
  ): Promise<ProductReview> {
    const review = await this.productReviewRepository.findOne({
      where,
      relations: REVIEW_RELATIONS,
    });
    if (!review) {
      throw new NotFoundException(ErrorMessage.PRODUCT_REVIEW_NOT_FOUND);
    }
    return review;
  }

  async create(dto: CreateProductReviewDto): Promise<ProductReviewResponse> {
    await this.assertSlugUnique(dto.slug);
    await this.assertProducts(dto.productIds);
    await this.assertCategories(dto.categoryIds);

    const { payload, relations } = this.stripRelations(dto);

    const saved = await this.productReviewRepository.manager.transaction(
      async (manager) => {
        const review = await manager.save(
          manager.create(ProductReview, payload),
        );
        await this.syncProducts(manager, review.id, relations.productIds!);
        await this.syncCategories(manager, review.id, relations.categoryIds!);
        return review;
      },
    );

    return this.toResponse(await this.findReviewOrThrow({ id: saved.id }));
  }

  async findAll(dto: ProductReviewQueryDto) {
    const filteredIds = await this.resolveFilteredReviewIds(dto);
    const page = Number(dto.page) > 0 ? Number(dto.page) : 1;
    const limit = Number(dto.limit) > 0 ? Number(dto.limit) : 10;

    if (filteredIds && !filteredIds.length) {
      return {
        data: [],
        metadata: {
          page,
          limit,
          total: 0,
          totalPage: 0,
        },
      };
    }

    const result = await this.getAllGeneric({
      filter: filteredIds ? { id: filteredIds } : undefined,
      search: dto.search,
      page: dto.page,
      limit: dto.limit,
      sortBy: dto.sortBy ?? PRODUCT_REVIEW_DEFAULT_SORT_BY,
      sort: dto.sort ?? PRODUCT_REVIEW_DEFAULT_SORT,
      relations: REVIEW_RELATIONS,
      select: REVIEW_SELECT,
    });

    return {
      ...result,
      data: result.data.map((row) => this.toResponse(row)),
    };
  }

  async findOne(id: number): Promise<ProductReviewResponse> {
    return this.toResponse(await this.findReviewOrThrow({ id }));
  }

  async findBySlug(slug: string): Promise<ProductReviewResponse> {
    return this.toResponse(await this.findReviewOrThrow({ slug }));
  }

  async update(
    id: number,
    dto: UpdateProductReviewDto,
  ): Promise<ProductReviewResponse> {
    await this.assertSlugUnique(dto.slug, id);

    const existing = await this.productReviewRepository.findOne({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(ErrorMessage.PRODUCT_REVIEW_NOT_FOUND);
    }

    const { payload, relations } = this.stripRelations(dto);

    if (relations.productIds) {
      await this.assertProducts(relations.productIds);
    }
    if (relations.categoryIds) {
      await this.assertCategories(relations.categoryIds);
    }

    await this.productReviewRepository.manager.transaction(async (manager) => {
      if (Object.keys(payload).length > 0) {
        await manager.update(ProductReview, id, payload);
      }
      if (relations.productIds) {
        await this.syncProducts(manager, id, relations.productIds);
      }
      if (relations.categoryIds) {
        await this.syncCategories(manager, id, relations.categoryIds);
      }
    });

    return this.toResponse(await this.findReviewOrThrow({ id }));
  }

  async delete(id: number): Promise<void> {
    const review = await this.productReviewRepository.findOne({
      where: { id },
    });
    if (!review) {
      throw new NotFoundException(ErrorMessage.PRODUCT_REVIEW_NOT_FOUND);
    }
    await this.productReviewRepository.softDelete(id);
  }
}
