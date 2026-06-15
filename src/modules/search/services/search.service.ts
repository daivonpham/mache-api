import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { applyEntitySearch } from "src/common/base/utils/apply-entity-search";
import { BlogPublishStatus } from "src/modules/blog/constants/blog.types";
import { BlogPost } from "src/modules/blog/entities/blog-post.entity";
import { ProductReview } from "src/modules/review/entities/product-review.entity";
import { Product } from "src/modules/product/entities/product.entity";
import { ObjectLiteral, Repository, SelectQueryBuilder } from "typeorm";
import { SearchQueryDto } from "../constants/search.dto";
import {
  GlobalSearchResponse,
  SearchGroupResponse,
  SearchHitResponse,
  SearchPaginationMeta,
} from "../constants/search.response";
import { SearchResourceType } from "../constants/search.types";

const DEFAULT_SEARCH_TYPES: SearchResourceType[] = [
  SearchResourceType.PRODUCT,
  SearchResourceType.BLOG,
  SearchResourceType.REVIEW,
];

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(BlogPost)
    private readonly blogPostRepository: Repository<BlogPost>,
    @InjectRepository(ProductReview)
    private readonly productReviewRepository: Repository<ProductReview>,
  ) {}

  async search(dto: SearchQueryDto): Promise<GlobalSearchResponse> {
    const types = dto.types?.length ? dto.types : DEFAULT_SEARCH_TYPES;
    const page = Number(dto.page) > 0 ? Number(dto.page) : 1;
    const limit = Number(dto.limit) > 0 ? Number(dto.limit) : 10;

    const response: GlobalSearchResponse = {
      query: dto.search,
    };

    const tasks = types.map(async (type) => {
      switch (type) {
        case SearchResourceType.PRODUCT:
          response.products = await this.searchProducts(
            dto.search,
            page,
            limit,
          );
          break;
        case SearchResourceType.BLOG:
          response.blogPosts = await this.searchBlogPosts(
            dto.search,
            page,
            limit,
          );
          break;
        case SearchResourceType.REVIEW:
          response.productReviews = await this.searchProductReviews(
            dto.search,
            page,
            limit,
          );
          break;
      }
    });

    await Promise.all(tasks);
    return response;
  }

  private buildPaginationMeta(
    page: number,
    limit: number,
    total: number,
  ): SearchPaginationMeta {
    return {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    };
  }

  private async paginatedSearch<Entity extends ObjectLiteral>(
    qb: SelectQueryBuilder<Entity>,
    page: number,
    limit: number,
  ): Promise<SearchGroupResponse> {
    qb.skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return {
      data: data as unknown as SearchHitResponse[],
      metadata: this.buildPaginationMeta(page, limit, total),
    };
  }

  private async searchProducts(
    search: string,
    page: number,
    limit: number,
  ): Promise<SearchGroupResponse> {
    const alias = "product";
    const qb = this.productRepository
      .createQueryBuilder(alias)
      .leftJoinAndSelect(`${alias}.thumbnailMedia`, "thumbnailMedia")
      .where(`${alias}.isActive = :isActive`, { isActive: true })
      .andWhere(`${alias}.deletedAt IS NULL`);

    applyEntitySearch(qb, alias, Product.prototype, search);

    qb.orderBy(`${alias}.createdAt`, "DESC");

    const result = await this.paginatedSearch(qb, page, limit);

    return {
      ...result,
      data: result.data.map((row) =>
        this.mapProductHit(row as unknown as Product),
      ),
    };
  }

  private async searchBlogPosts(
    search: string,
    page: number,
    limit: number,
  ): Promise<SearchGroupResponse> {
    const alias = "blogPost";
    const qb = this.blogPostRepository
      .createQueryBuilder(alias)
      .leftJoinAndSelect(`${alias}.thumbnailMedia`, "thumbnailMedia")
      .where(`${alias}.isActive = :isActive`, { isActive: true })
      .andWhere(`${alias}.publishStatus = :publishStatus`, {
        publishStatus: BlogPublishStatus.PUBLISHED,
      })
      .andWhere(`${alias}.deletedAt IS NULL`);

    applyEntitySearch(qb, alias, BlogPost.prototype, search);

    qb.orderBy(`${alias}.publishedAt`, "DESC", "NULLS LAST");

    const result = await this.paginatedSearch(qb, page, limit);

    return {
      ...result,
      data: result.data.map((row) =>
        this.mapBlogPostHit(row as unknown as BlogPost),
      ),
    };
  }

  private async searchProductReviews(
    search: string,
    page: number,
    limit: number,
  ): Promise<SearchGroupResponse> {
    const alias = "productReview";
    const qb = this.productReviewRepository
      .createQueryBuilder(alias)
      .where(`${alias}.isActive = :isActive`, { isActive: true })
      .andWhere(`${alias}.deletedAt IS NULL`);

    applyEntitySearch(qb, alias, ProductReview.prototype, search);

    qb.orderBy(`${alias}.createdAt`, "DESC");

    const result = await this.paginatedSearch(qb, page, limit);

    return {
      ...result,
      data: result.data.map((row) =>
        this.mapProductReviewHit(row as unknown as ProductReview),
      ),
    };
  }

  private mapProductHit(product: Product): SearchHitResponse {
    return {
      type: SearchResourceType.PRODUCT,
      id: product.id,
      title: product.name,
      slug: product.slug,
      description: product.description ?? null,
      url: product.thumbnailMedia?.url ?? null,
    };
  }

  private mapBlogPostHit(post: BlogPost): SearchHitResponse {
    return {
      type: SearchResourceType.BLOG,
      id: post.id,
      title: post.title,
      slug: post.slug,
      description: post.description ?? null,
      url: post.thumbnailMedia?.url ?? null,
    };
  }

  private mapProductReviewHit(review: ProductReview): SearchHitResponse {
    return {
      type: SearchResourceType.REVIEW,
      id: review.id,
      title: review.title,
      slug: review.slug,
      description: review.description ?? null,
      url: review.youtubeUrl ?? null,
    };
  }
}
