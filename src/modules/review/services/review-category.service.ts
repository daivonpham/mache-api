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
  CreateReviewCategoryDto,
  ReviewCategoryQueryDto,
  UpdateReviewCategoryDto,
} from "../constants/review-category.dto";
import { ReviewCategoryResponse } from "../constants/review-category.response";
import { ProductReviewCategory } from "../entities/product-review-category.entity";
import { ReviewCategory } from "../entities/review-category.entity";

@Injectable()
export class ReviewCategoryService extends BaseService<ReviewCategory> {
  constructor(
    @InjectRepository(ReviewCategory)
    private readonly reviewCategoryRepository: Repository<ReviewCategory>,
    @InjectRepository(ProductReviewCategory)
    private readonly productReviewCategoryRepository: Repository<ProductReviewCategory>,
  ) {
    super(reviewCategoryRepository);
  }

  toResponse(category: ReviewCategory): ReviewCategoryResponse {
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
    const existing = await this.reviewCategoryRepository.findOne({
      where: { slug },
    });
    if (existing && existing.id !== excludeId) {
      throw new BadRequestException(ErrorMessage.SLUG_ALREADY_EXISTS);
    }
  }

  async create(dto: CreateReviewCategoryDto): Promise<ReviewCategoryResponse> {
    await this.assertSlugUnique(dto.slug);
    const saved = await this.reviewCategoryRepository.save(
      this.reviewCategoryRepository.create(dto),
    );
    return this.toResponse(saved);
  }

  async findAll(dto: ReviewCategoryQueryDto) {
    const result = await this.getAllGeneric({
      filter: { isActive: dto.isActive },
      search: dto.search,
      page: dto.page,
      limit: dto.limit,
      select: ["id", "name", "slug", "isActive", "createdAt", "updatedAt"],
    });
    return {
      ...result,
      data: result.data.map((row) => this.toResponse(row)),
    };
  }

  async findOne(id: number): Promise<ReviewCategoryResponse> {
    const category = await this.reviewCategoryRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(ErrorMessage.REVIEW_CATEGORY_NOT_FOUND);
    }
    return this.toResponse(category);
  }

  async findBySlug(slug: string): Promise<ReviewCategoryResponse> {
    const category = await this.reviewCategoryRepository.findOne({
      where: { slug },
    });
    if (!category) {
      throw new NotFoundException(ErrorMessage.REVIEW_CATEGORY_NOT_FOUND);
    }
    return this.toResponse(category);
  }

  async update(
    id: number,
    dto: UpdateReviewCategoryDto,
  ): Promise<ReviewCategoryResponse> {
    await this.assertSlugUnique(dto.slug, id);
    const category = await this.reviewCategoryRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(ErrorMessage.REVIEW_CATEGORY_NOT_FOUND);
    }
    await this.reviewCategoryRepository.update(id, dto);
    const updated = await this.reviewCategoryRepository.findOne({
      where: { id },
    });
    return this.toResponse(updated!);
  }

  async delete(id: number): Promise<void> {
    const category = await this.reviewCategoryRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(ErrorMessage.REVIEW_CATEGORY_NOT_FOUND);
    }
    const inUse = await this.productReviewCategoryRepository.count({
      where: { reviewCategoryId: id },
    });
    if (inUse > 0) {
      throw new BadRequestException(ErrorMessage.REVIEW_CATEGORY_IN_USE);
    }
    await this.reviewCategoryRepository.softDelete(id);
  }
}
