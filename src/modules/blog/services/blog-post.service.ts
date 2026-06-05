import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseService } from "src/common/base/services/base-service";
import { ErrorMessage } from "src/common/constants/err";
import { Media, MediaKind } from "src/modules/media/entities/media.entity";
import { Product } from "src/modules/product/entities/product.entity";
import { EntityManager, In, Repository } from "typeorm";
import {
  BlogPostQueryDto,
  CreateBlogPostDto,
  UpdateBlogPostDto,
} from "../constants/blog-post.dto";
import { BlogPublishStatus } from "../constants/blog.types";
import { BlogCategory } from "../entities/blog-category.entity";
import { BlogPostCategory } from "../entities/blog-post-category.entity";
import { BlogPostProduct } from "../entities/blog-post-product.entity";
import { BlogPostTag } from "../entities/blog-post-tag.entity";
import { BlogPost } from "../entities/blog-post.entity";
import { BlogTag } from "../entities/blog-tag.entity";

type RelationIds = {
  categoryIds?: number[];
  primaryCategoryId?: number;
  tagIds?: number[];
  productIds?: number[];
};

const BLOG_POST_RELATIONS = [
  "postCategories",
  "postCategories.category",
  "postTags",
  "postTags.tag",
  "postProducts",
  "postProducts.product",
  "thumbnailMedia",
];

const BLOG_POST_SELECT = [
  "id",
  "title",
  "slug",
  "content",
  "description",
  "seo",
  "publishStatus",
  "scheduledAt",
  "publishedAt",
  "isActive",
  "createdAt",
  "updatedAt",
  "postCategories",
  "postCategories.category.id",
  "postCategories.category.name",
  "postTags",
  "postTags.tag.id",
  "postTags.tag.name",
  "postProducts",
  "postProducts.product.id",
  "postProducts.product.name",
  "postProducts.product.slug",
  "thumbnailMedia.url",
];

@Injectable()
export class BlogPostService extends BaseService<BlogPost> {
  constructor(
    @InjectRepository(BlogPost)
    private readonly blogPostRepository: Repository<BlogPost>,
    @InjectRepository(BlogCategory)
    private readonly blogCategoryRepository: Repository<BlogCategory>,
    @InjectRepository(BlogTag)
    private readonly blogTagRepository: Repository<BlogTag>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
  ) {
    super(blogPostRepository);
  }

  private stripRelations<T extends CreateBlogPostDto | UpdateBlogPostDto>(
    dto: T,
  ): {
    payload: Omit<
      T,
      "categoryIds" | "primaryCategoryId" | "tagIds" | "productIds"
    >;
    relations: RelationIds;
  } {
    const {
      categoryIds,
      primaryCategoryId,
      tagIds,
      productIds,
      ...payload
    } = dto;
    return {
      payload,
      relations: { categoryIds, primaryCategoryId, tagIds, productIds },
    };
  }

  private resolvePublishedAt(
    publishStatus: BlogPublishStatus,
    publishedAt?: string | Date | null,
  ): Date | null | undefined {
    if (publishStatus === BlogPublishStatus.PUBLISHED) {
      if (publishedAt) return new Date(publishedAt);
      return new Date();
    }
    if (publishedAt === null) return null;
    if (publishedAt) return new Date(publishedAt);
    return undefined;
  }

  private buildPostPayload(
    dto: Omit<
      CreateBlogPostDto,
      "categoryIds" | "primaryCategoryId" | "tagIds" | "productIds"
    >,
  ): Partial<BlogPost> {
    const publishStatus = dto.publishStatus ?? BlogPublishStatus.DRAFT;
    const publishedAt = this.resolvePublishedAt(
      publishStatus,
      dto.publishedAt,
    );
    const { scheduledAt, publishedAt: _pa, publishStatus: _ps, ...rest } = dto;

    return {
      ...rest,
      publishStatus,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      ...(publishedAt !== undefined ? { publishedAt } : {}),
    };
  }

  private async assertSlugUnique(
    slug?: string,
    excludeId?: number,
  ): Promise<void> {
    if (!slug) return;
    const existing = await this.blogPostRepository.findOne({ where: { slug } });
    if (existing && existing.id !== excludeId) {
      throw new BadRequestException(ErrorMessage.SLUG_ALREADY_EXISTS);
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

  private async assertCategories(
    categoryIds: number[],
    primaryCategoryId?: number,
  ): Promise<void> {
    if (!categoryIds.length) {
      throw new BadRequestException(ErrorMessage.BLOG_CATEGORY_IDS_REQUIRED);
    }
    const uniqueIds = [...new Set(categoryIds)];
    const found = await this.blogCategoryRepository.find({
      where: { id: In(uniqueIds) },
    });
    if (found.length !== uniqueIds.length) {
      throw new NotFoundException(ErrorMessage.BLOG_CATEGORY_NOT_FOUND);
    }
    const primary = primaryCategoryId ?? categoryIds[0];
    if (!categoryIds.includes(primary)) {
      throw new BadRequestException(
        ErrorMessage.BLOG_PRIMARY_CATEGORY_INVALID,
      );
    }
  }

  private async assertTags(tagIds: number[]): Promise<void> {
    if (!tagIds.length) return;
    const uniqueIds = [...new Set(tagIds)];
    const found = await this.blogTagRepository.find({
      where: { id: In(uniqueIds) },
    });
    if (found.length !== uniqueIds.length) {
      throw new NotFoundException(ErrorMessage.BLOG_TAG_NOT_FOUND);
    }
  }

  private async assertProducts(productIds: number[]): Promise<void> {
    if (!productIds.length) return;
    if (productIds.length > 2) {
      throw new BadRequestException(ErrorMessage.BLOG_PRODUCT_IDS_MAX_TWO);
    }
    const uniqueIds = [...new Set(productIds)];
    const found = await this.productRepository.find({
      where: { id: In(uniqueIds) },
    });
    if (found.length !== uniqueIds.length) {
      throw new NotFoundException(ErrorMessage.PRODUCT_NOT_FOUND);
    }
  }

  private async syncCategories(
    manager: EntityManager,
    postId: number,
    categoryIds: number[],
    primaryCategoryId?: number,
  ): Promise<void> {
    const repo = manager.getRepository(BlogPostCategory);
    await repo.delete({ blogPostId: postId });
    if (!categoryIds.length) return;

    const primary = primaryCategoryId ?? categoryIds[0];
    const rows = categoryIds.map((blogCategoryId) =>
      repo.create({
        blogPostId: postId,
        blogCategoryId,
        isPrimary: blogCategoryId === primary,
      }),
    );
    await repo.save(rows);
  }

  private async syncTags(
    manager: EntityManager,
    postId: number,
    tagIds: number[],
  ): Promise<void> {
    const repo = manager.getRepository(BlogPostTag);
    await repo.delete({ blogPostId: postId });
    if (!tagIds.length) return;
    const rows = tagIds.map((blogTagId) =>
      repo.create({ blogPostId: postId, blogTagId }),
    );
    await repo.save(rows);
  }

  private async syncProducts(
    manager: EntityManager,
    postId: number,
    productIds: number[],
  ): Promise<void> {
    const repo = manager.getRepository(BlogPostProduct);
    await repo.delete({ blogPostId: postId });
    if (!productIds.length) return;
    const rows = productIds.map((productId, sortOrder) =>
      repo.create({
        blogPostId: postId,
        productId,
        sortOrder,
      }),
    );
    await repo.save(rows);
  }

  private async findPostOrThrow(
    where: { id: number } | { slug: string },
  ): Promise<BlogPost> {
    const post = await this.blogPostRepository.findOne({
      where,
      relations: BLOG_POST_RELATIONS,
    });
    if (!post) {
      throw new NotFoundException(ErrorMessage.BLOG_POST_NOT_FOUND);
    }
    return post;
  }

  async create(dto: CreateBlogPostDto) {
    await this.assertSlugUnique(dto.slug);
    await this.assertThumbnailMedia(dto.thumbnailMediaId);
    await this.assertCategories(dto.categoryIds, dto.primaryCategoryId);
    if (dto.tagIds?.length) await this.assertTags(dto.tagIds);
    if (dto.productIds?.length) await this.assertProducts(dto.productIds);

    const { payload, relations } = this.stripRelations(dto);

    const saved = await this.blogPostRepository.manager.transaction(
      async (manager) => {
        const post = await manager.save(
          manager.create(BlogPost, this.buildPostPayload(payload)),
        );
        await this.syncCategories(
          manager,
          post.id,
          relations.categoryIds!,
          relations.primaryCategoryId,
        );
        if (relations.tagIds) {
          await this.syncTags(manager, post.id, relations.tagIds);
        }
        if (relations.productIds) {
          await this.syncProducts(manager, post.id, relations.productIds);
        }
        return post;
      },
    );

    return this.findPostOrThrow({ id: saved.id });
  }

  async findAll(dto: BlogPostQueryDto) {
    return this.getAllGeneric({
      filter: {
        publishStatus: dto.publishStatus,
        isActive: dto.isActive,
        isDeleted: null,
      },
      search: dto.search,
      page: dto.page,
      limit: dto.limit,
      sortBy: dto.sortBy,
      sort: dto.sort,
      relations: BLOG_POST_RELATIONS,
      select: BLOG_POST_SELECT,
    });
  }

  async findOne(id: number) {
    return this.findPostOrThrow({ id });
  }

  async findBySlug(slug: string) {
    return this.findPostOrThrow({ slug });
  }

  async update(id: number, dto: UpdateBlogPostDto) {
    await this.assertSlugUnique(dto.slug, id);
    if (dto.thumbnailMediaId !== undefined) {
      await this.assertThumbnailMedia(dto.thumbnailMediaId);
    }

    const existing = await this.blogPostRepository.findOne({ where: { id } });
    if (!existing) {
      throw new NotFoundException(ErrorMessage.BLOG_POST_NOT_FOUND);
    }
    const { payload, relations } = this.stripRelations(dto);

    if (relations.categoryIds) {
      await this.assertCategories(
        relations.categoryIds,
        relations.primaryCategoryId,
      );
    }
    if (relations.tagIds) await this.assertTags(relations.tagIds);
    if (relations.productIds) await this.assertProducts(relations.productIds);

    const publishStatus =
      payload.publishStatus ?? existing.publishStatus;
    const {
      scheduledAt,
      publishedAt: publishedAtInput,
      publishStatus: _ps,
      ...rest
    } = payload;

    const postPayload: Partial<BlogPost> = { ...rest };

    if (scheduledAt !== undefined) {
      postPayload.scheduledAt = scheduledAt
        ? new Date(scheduledAt)
        : null;
    }
    if (payload.publishStatus !== undefined) {
      postPayload.publishStatus = publishStatus;
    }
    if (
      payload.publishStatus !== undefined ||
      payload.publishedAt !== undefined
    ) {
      const resolved = this.resolvePublishedAt(
        publishStatus,
        publishedAtInput ?? existing.publishedAt,
      );
      if (resolved !== undefined) {
        postPayload.publishedAt = resolved;
      }
    }

    await this.blogPostRepository.manager.transaction(async (manager) => {
      if (Object.keys(postPayload).length > 0) {
        await manager.update(BlogPost, id, postPayload);
      }
      if (relations.categoryIds) {
        await this.syncCategories(
          manager,
          id,
          relations.categoryIds,
          relations.primaryCategoryId,
        );
      }
      if (relations.tagIds !== undefined) {
        await this.syncTags(manager, id, relations.tagIds);
      }
      if (relations.productIds !== undefined) {
        await this.syncProducts(manager, id, relations.productIds);
      }
    });

    return this.findPostOrThrow({ id });
  }

  async delete(id: number): Promise<void> {
    const post = await this.blogPostRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException(ErrorMessage.BLOG_POST_NOT_FOUND);
    }
    await this.blogPostRepository.softDelete(id);
  }
}
