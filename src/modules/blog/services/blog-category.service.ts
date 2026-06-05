import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseService } from "src/common/base/services/base-service";
import { ErrorMessage } from "src/common/constants/err";
import { Repository } from "typeorm";
import {
  BlogCategoryQueryDto,
  CreateBlogCategoryDto,
  UpdateBlogCategoryDto,
} from "../constants/blog-category.dto";
import { BlogCategoryResponse } from "../constants/blog-category.response";
import { BlogCategory } from "../entities/blog-category.entity";
import { BlogPostCategory } from "../entities/blog-post-category.entity";

@Injectable()
export class BlogCategoryService extends BaseService<BlogCategory> {
  constructor(
    @InjectRepository(BlogCategory)
    private readonly blogCategoryRepository: Repository<BlogCategory>,
    @InjectRepository(BlogPostCategory)
    private readonly blogPostCategoryRepository: Repository<BlogPostCategory>,
  ) {
    super(blogCategoryRepository);
  }

  toResponse(category: BlogCategory): BlogCategoryResponse {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  private async assertSlugUnique(
    slug?: string,
    excludeId?: number,
  ): Promise<void> {
    if (!slug) return;
    const existing = await this.blogCategoryRepository.findOne({
      where: { slug },
    });
    if (existing && existing.id !== excludeId) {
      throw new BadRequestException(ErrorMessage.SLUG_ALREADY_EXISTS);
    }
  }

  async create(dto: CreateBlogCategoryDto): Promise<BlogCategoryResponse> {
    await this.assertSlugUnique(dto.slug);
    const saved = await this.blogCategoryRepository.save(
      this.blogCategoryRepository.create(dto),
    );
    return this.toResponse(saved);
  }

  async findAll(dto: BlogCategoryQueryDto) {
    return this.getAllGeneric({
      filter: { isActive: dto.isActive },
      search: dto.search,
      page: dto.page,
      limit: dto.limit,
      select: ["id", "name", "slug", "isActive", "createdAt", "updatedAt"],
    });
  }

  async findOne(id: number): Promise<BlogCategoryResponse> {
    const category = await this.blogCategoryRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(ErrorMessage.BLOG_CATEGORY_NOT_FOUND);
    }
    return this.toResponse(category);
  }

  async findBySlug(slug: string): Promise<BlogCategoryResponse> {
    const category = await this.blogCategoryRepository.findOne({
      where: { slug },
    });
    if (!category) {
      throw new NotFoundException(ErrorMessage.BLOG_CATEGORY_NOT_FOUND);
    }
    return this.toResponse(category);
  }

  async update(
    id: number,
    dto: UpdateBlogCategoryDto,
  ): Promise<BlogCategoryResponse> {
    await this.assertSlugUnique(dto.slug, id);
    const category = await this.blogCategoryRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(ErrorMessage.BLOG_CATEGORY_NOT_FOUND);
    }
    await this.blogCategoryRepository.update(id, dto);
    const updated = await this.blogCategoryRepository.findOne({
      where: { id },
    });
    return this.toResponse(updated!);
  }

  async delete(id: number): Promise<void> {
    const category = await this.blogCategoryRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(ErrorMessage.BLOG_CATEGORY_NOT_FOUND);
    }
    const inUse = await this.blogPostCategoryRepository.count({
      where: { blogCategoryId: id },
    });
    if (inUse > 0) {
      throw new BadRequestException(ErrorMessage.BLOG_CATEGORY_IN_USE);
    }
    await this.blogCategoryRepository.softDelete(id);
  }
}
