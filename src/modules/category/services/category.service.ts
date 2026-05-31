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
    CategoryQueryDto,
    CreateCategoryDto,
    UpdateCategoryDto,
} from "../constants/category.dto";
import { CategoryResponse } from "../constants/category.response";
import { Category } from "../entities/category.entity";

@Injectable()
export class CategoryService extends BaseService<Category> {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>
    ) {
        super(categoryRepository)
    }

    toResponse(category: Category): CategoryResponse {
        return {
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            icon: category.icon,
            parentId: category.parentId ?? null,
            isActive: category.isActive,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
        };
    }

    private async assertSlugUnique(slug?: string, excludeId?: number): Promise<void> {
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
            throw new BadRequestException(ErrorMessage.CATEGORY_CANNOT_BE_PARENT_OF_ITSELF);
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
        const category = this.categoryRepository.create(dto);
        const saved = await this.categoryRepository.save(category);
        return this.toResponse(saved);
    }

    async findAll(dto: CategoryQueryDto) {
        return this.getAllGeneric({
            filter: { parentId: dto.parentId, isActive: dto.isActive },
            search: dto.search,
            page: dto.page,
            limit: dto.limit,
            select: [
                "id",
                "name",
                "slug",
                "description",
                "icon",
                "parentId",
                "isActive",
                "createdAt",
                "updatedAt",
            ],
        });
    }

    async findOne(id: number): Promise<CategoryResponse> {
        const category = await this.categoryRepository.findOne({ where: { id } });
        if (!category) {
            throw new NotFoundException(ErrorMessage.CATEGORY_NOT_FOUND);
        }
        return this.toResponse(category);
    }

    async findBySlug(slug: string): Promise<CategoryResponse> {
        const category = await this.categoryRepository.findOne({where: {slug}});
        if (!category) {
            throw new NotFoundException(ErrorMessage.CATEGORY_NOT_FOUND);
        }
        return this.toResponse(category)
    }

    async update(id: number, dto: UpdateCategoryDto): Promise<CategoryResponse> {
        await this.assertSlugUnique(dto.slug);
        await this.assertParentValid(dto.parentId, id);
        const category = await this.categoryRepository.findOne({ where: { id } });
        if (!category) {
            throw new NotFoundException(ErrorMessage.CATEGORY_NOT_FOUND);
        }
        await this.categoryRepository.update(id, dto);
        const updated = await this.categoryRepository.findOne({ where: { id } });
        return this.toResponse(updated!);
    }

    async delete(id: number): Promise<void> {
        const category = await this.categoryRepository.findOne({ where: { id } });
        if (!category) {
            throw new NotFoundException(ErrorMessage.CATEGORY_NOT_FOUND);
        }
        const childCount = await this.categoryRepository.count({ where: { parentId: id } });
        if (childCount > 0) throw new BadRequestException(ErrorMessage.CATEGORY_CANNOT_BE_DELETED_HAS_CHILDREN);
        await this.categoryRepository.softDelete(id);
    }


}