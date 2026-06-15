import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseService } from "src/common/base/services/base-service";
import { ErrorMessage } from "src/common/constants/err";
import { Media, MediaKind } from "src/modules/media/entities/media.entity";
import { Repository } from "typeorm";
import {
  CategoryQueryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../constants/category.dto";
import { CategoryResponse } from "../constants/category.response";
import { Category } from "../entities/category.entity";

const CATEGORY_RELATIONS = ["thumbnailMedia"];

const CATEGORY_SELECT = [
  "id",
  "name",
  "slug",
  "description",
  "icon",
  "parentId",
  "thumbnailMediaId",
  "isActive",
  "createdAt",
  "updatedAt",
  "thumbnailMedia.url",
];

@Injectable()
export class CategoryService extends BaseService<Category> {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
  ) {
    super(categoryRepository);
  }

  toResponse(category: Category): CategoryResponse {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      parentId: category.parentId ?? null,
      thumbnailMediaId: category.thumbnailMediaId ?? null,
      thumbnailUrl: category.thumbnailMedia?.url ?? null,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
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

  private async findCategoryOrThrow(
    where: { id: number } | { slug: string },
  ): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where,
      relations: CATEGORY_RELATIONS,
    });
    if (!category) {
      throw new NotFoundException(ErrorMessage.CATEGORY_NOT_FOUND);
    }
    return category;
  }

  private async assertSlugUnique(
    slug?: string,
    excludeId?: number,
  ): Promise<void> {
    if (!slug) return;
    const existing = await this.categoryRepository.findOne({ where: { slug } });
    if (existing && existing.id !== excludeId) {
      throw new BadRequestException(ErrorMessage.SLUG_ALREADY_EXISTS);
    }
  }

  private async assertParentValid(
    parentId: number | null | undefined,
    selfId?: number,
  ): Promise<void> {
    if (parentId == null) return;
    if (selfId != null && parentId === selfId) {
      throw new BadRequestException(
        ErrorMessage.CATEGORY_CANNOT_BE_PARENT_OF_ITSELF,
      );
    }
    const parent = await this.categoryRepository.findOne({
      where: { id: parentId },
    });
    if (!parent) {
      throw new BadRequestException(ErrorMessage.CATEGORY_PARENT_NOT_FOUND);
    }
  }

  async create(dto: CreateCategoryDto): Promise<CategoryResponse> {
    await this.assertSlugUnique(dto.slug);
    await this.assertParentValid(dto.parentId, undefined);
    await this.assertThumbnailMedia(dto.thumbnailMediaId);
    const category = this.categoryRepository.create(dto);
    const saved = await this.categoryRepository.save(category);
    return this.toResponse(await this.findCategoryOrThrow({ id: saved.id }));
  }

  async findAll(dto: CategoryQueryDto) {
    const result = await this.getAllGeneric({
      getAll: true,
      filter: { parentId: dto.parentId, isActive: dto.isActive },
      search: dto.search,
      page: dto.page,
      limit: dto.limit,
      relations: CATEGORY_RELATIONS,
      select: CATEGORY_SELECT,
    });
    return {
      ...result,
      data: result.data.map((category) => this.toResponse(category)),
    };
  }

  async findOne(id: number): Promise<CategoryResponse> {
    return this.toResponse(await this.findCategoryOrThrow({ id }));
  }

  async findBySlug(slug: string): Promise<CategoryResponse> {
    return this.toResponse(await this.findCategoryOrThrow({ slug }));
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<CategoryResponse> {
    await this.assertSlugUnique(dto.slug, id);
    await this.assertParentValid(dto.parentId, id);
    if (dto.thumbnailMediaId !== undefined) {
      await this.assertThumbnailMedia(dto.thumbnailMediaId);
    }
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(ErrorMessage.CATEGORY_NOT_FOUND);
    }
    await this.categoryRepository.update(id, dto);
    return this.toResponse(await this.findCategoryOrThrow({ id }));
  }

  async delete(id: number): Promise<void> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(ErrorMessage.CATEGORY_NOT_FOUND);
    }
    const childCount = await this.categoryRepository.count({
      where: { parentId: id },
    });
    if (childCount > 0)
      throw new BadRequestException(
        ErrorMessage.CATEGORY_CANNOT_BE_DELETED_HAS_CHILDREN,
      );
    await this.categoryRepository.softDelete(id);
  }
}
