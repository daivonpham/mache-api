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
  BlogTagQueryDto,
  CreateBlogTagDto,
  UpdateBlogTagDto,
} from "../constants/blog-tag.dto";
import { BlogTagResponse } from "../constants/blog-tag.response";
import { BlogTag } from "../entities/blog-tag.entity";

@Injectable()
export class BlogTagService extends BaseService<BlogTag> {
  constructor(
    @InjectRepository(BlogTag)
    private readonly blogTagRepository: Repository<BlogTag>,
  ) {
    super(blogTagRepository);
  }

  toResponse(tag: BlogTag): BlogTagResponse {
    return {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      isActive: tag.isActive,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    };
  }

  private async assertUnique(
    dto: { name?: string; slug?: string },
    excludeId?: number,
  ): Promise<void> {
    if (dto.name) {
      const byName = await this.blogTagRepository.findOne({
        where: { name: dto.name },
      });
      if (byName && byName.id !== excludeId) {
        throw new BadRequestException(
          ErrorMessage.BLOG_TAG_NAME_ALREADY_EXISTS,
        );
      }
    }
    if (dto.slug) {
      const bySlug = await this.blogTagRepository.findOne({
        where: { slug: dto.slug },
      });
      if (bySlug && bySlug.id !== excludeId) {
        throw new BadRequestException(
          ErrorMessage.BLOG_TAG_SLUG_ALREADY_EXISTS,
        );
      }
    }
  }

  async create(dto: CreateBlogTagDto): Promise<BlogTagResponse> {
    await this.assertUnique(dto);
    const saved = await this.blogTagRepository.save(
      this.blogTagRepository.create(dto),
    );
    return this.toResponse(saved);
  }

  async findAll(dto: BlogTagQueryDto) {
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

  async findOne(id: number): Promise<BlogTagResponse> {
    const tag = await this.blogTagRepository.findOne({ where: { id } });
    if (!tag) {
      throw new NotFoundException(ErrorMessage.BLOG_TAG_NOT_FOUND);
    }
    return this.toResponse(tag);
  }

  async update(id: number, dto: UpdateBlogTagDto): Promise<BlogTagResponse> {
    await this.assertUnique(dto, id);
    const tag = await this.blogTagRepository.findOne({ where: { id } });
    if (!tag) {
      throw new NotFoundException(ErrorMessage.BLOG_TAG_NOT_FOUND);
    }
    await this.blogTagRepository.update(id, dto);
    const updated = await this.blogTagRepository.findOne({ where: { id } });
    return this.toResponse(updated!);
  }

  async delete(id: number): Promise<void> {
    const tag = await this.blogTagRepository.findOne({ where: { id } });
    if (!tag) {
      throw new NotFoundException(ErrorMessage.BLOG_TAG_NOT_FOUND);
    }
    await this.blogTagRepository.softDelete(id);
  }
}
