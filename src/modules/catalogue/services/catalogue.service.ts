import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseService } from "src/common/base/services/base-service";
import { Brand } from "src/modules/brand/entities/brand.entity";
import { Media, MediaKind } from "src/modules/media/entities/media.entity";
import { Repository } from "typeorm";
import {
  CatalogueCategoryQueryDto,
  CatalogueQueryDto,
  CreateCatalogueCategoryDto,
  CreateCatalogueDto,
  UpdateCatalogueCategoryDto,
  UpdateCatalogueDto,
} from "../constants/catalogue.dto";
import { CatalogueCategory } from "../entities/catalogue-category.entity";
import { Catalogue } from "../entities/catalogue.entity";

@Injectable()
export class CatalogueService extends BaseService<Catalogue> {
  constructor(
    @InjectRepository(Catalogue)
    private readonly catalogues: Repository<Catalogue>,
    @InjectRepository(CatalogueCategory)
    private readonly categories: Repository<CatalogueCategory>,
    @InjectRepository(Brand) private readonly brands: Repository<Brand>,
    @InjectRepository(Media) private readonly media: Repository<Media>,
  ) {
    super(catalogues);
  }

  private readonly relations = [
    "category",
    "brand",
    "pdfMedia",
    "thumbnailMedia",
  ];

  private map(item: Catalogue) {
    return {
      id: item.id,
      title: item.title,
      slug: item.slug,
      description: item.description,
      categoryId: item.categoryId,
      categoryName: item.category?.name,
      brandId: item.brandId ?? null,
      brandName: item.brand?.name ?? null,
      pdfMediaId: item.pdfMediaId,
      pdfUrl: item.pdfMedia?.url,
      thumbnailMediaId: item.thumbnailMediaId,
      thumbnailUrl: item.thumbnailMedia?.url,
      seo: item.seo ?? null,
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private async validate(dto: UpdateCatalogueDto, id?: number) {
    if (dto.slug) {
      const found = await this.catalogues.findOne({
        where: { slug: dto.slug },
        withDeleted: true,
      });
      if (found && found.id !== id)
        throw new BadRequestException("Slug catalogue đã tồn tại");
    }
    if (
      dto.categoryId !== undefined &&
      !(await this.categories.findOne({ where: { id: dto.categoryId } }))
    )
      throw new BadRequestException("Danh mục catalogue không tồn tại");
    if (
      dto.brandId != null &&
      !(await this.brands.findOne({ where: { id: dto.brandId } }))
    )
      throw new BadRequestException("Thương hiệu không tồn tại");
    for (const [key, kind, mime] of [
      ["pdfMediaId", MediaKind.DOCUMENT, "application/pdf"],
      ["thumbnailMediaId", MediaKind.IMAGE, null],
    ] as const) {
      const mediaId = dto[key];
      if (mediaId === undefined) continue;
      const file = await this.media.findOne({ where: { id: mediaId } });
      if (!file || file.kind !== kind || (mime && file.mimeType !== mime))
        throw new BadRequestException(
          key === "pdfMediaId"
            ? "File catalogue phải là PDF"
            : "Ảnh đại diện không hợp lệ",
        );
    }
  }

  async create(dto: CreateCatalogueDto) {
    await this.validate(dto);
    const saved = await this.catalogues.save(this.catalogues.create(dto));
    return this.findOne(saved.id);
  }
  async update(id: number, dto: UpdateCatalogueDto) {
    await this.findOne(id);
    await this.validate(dto, id);
    await this.catalogues.update(id, dto);
    return this.findOne(id);
  }
  async findOne(id: number) {
    const item = await this.catalogues.findOne({
      where: { id },
      relations: this.relations,
    });
    if (!item) throw new NotFoundException("Catalogue không tồn tại");
    return this.map(item);
  }
  async findBySlug(slug: string) {
    const item = await this.catalogues.findOne({
      where: { slug, isActive: true },
      relations: this.relations,
    });
    // Trang public: danh mục bị ẩn thì catalogue cũng không hiển thị
    if (!item || !item.category?.isActive) {
      throw new NotFoundException("Catalogue không tồn tại");
    }
    return this.map(item);
  }
  async findAll(dto: CatalogueQueryDto) {
    const page = Math.max(1, Number(dto.page) || 1),
      limit = Math.min(100, Math.max(1, Number(dto.limit) || 10));
    const qb = this.catalogues
      .createQueryBuilder("catalogue")
      .leftJoinAndSelect("catalogue.category", "category")
      .leftJoinAndSelect("catalogue.brand", "brand")
      .leftJoinAndSelect("catalogue.pdfMedia", "pdfMedia")
      .leftJoinAndSelect("catalogue.thumbnailMedia", "thumbnailMedia");
    if (dto.search?.trim())
      qb.andWhere(
        "(catalogue.title ILIKE :search OR catalogue.description ILIKE :search OR brand.name ILIKE :search OR category.name ILIKE :search)",
        { search: `%${dto.search.trim()}%` },
      );
    if (dto.categoryId)
      qb.andWhere("catalogue.categoryId = :categoryId", {
        categoryId: dto.categoryId,
      });
    if (dto.brandId)
      qb.andWhere("catalogue.brandId = :brandId", { brandId: dto.brandId });
    if (dto.isActive !== undefined)
      qb.andWhere("catalogue.isActive = :isActive", { isActive: dto.isActive });
    // Trang public chỉ hiển thị catalogue thuộc danh mục đang bật
    if (dto.isActive === true)
      qb.andWhere("category.isActive = :categoryActive", {
        categoryActive: true,
      });
    if (dto.sort === "title") qb.orderBy("catalogue.title", "ASC");
    else
      qb.orderBy("catalogue.updatedAt", dto.sort === "oldest" ? "ASC" : "DESC");
    qb.addOrderBy("catalogue.id", "DESC");
    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return {
      data: items.map((item) => this.map(item)),
      metadata: { page, limit, total, totalPage: Math.ceil(total / limit) },
    };
  }
  async delete(id: number) {
    await this.findOne(id);
    await this.catalogues.softDelete(id);
    return { message: "Deleted successfully" };
  }

  async stats() {
    const [total, active, categories] = await Promise.all([
      this.catalogues.count(),
      this.catalogues.count({ where: { isActive: true } }),
      this.categories.count(),
    ]);
    return { total, active, inactive: total - active, categories };
  }

  async categoriesAll(dto: CatalogueCategoryQueryDto = {}) {
    const items = await this.categories.find({
      where: dto.isActive === undefined ? {} : { isActive: dto.isActive },
      order: { name: "ASC" },
    });
    const counts: { categoryId: number; count: string }[] =
      await this.catalogues
        .createQueryBuilder("catalogue")
        .select("catalogue.categoryId", "categoryId")
        .addSelect("COUNT(*)", "count")
        .groupBy("catalogue.categoryId")
        .getRawMany();
    const countMap = new Map(
      counts.map((c) => [Number(c.categoryId), Number(c.count)]),
    );
    return items.map((item) => ({
      ...item,
      catalogueCount: countMap.get(item.id) ?? 0,
    }));
  }
  async createCategory(dto: CreateCatalogueCategoryDto) {
    if (
      await this.categories.findOne({
        where: { slug: dto.slug },
        withDeleted: true,
      })
    )
      throw new BadRequestException("Slug danh mục đã tồn tại");
    return this.categories.save(this.categories.create(dto));
  }
  async updateCategory(id: number, dto: UpdateCatalogueCategoryDto) {
    const category = await this.categories.findOne({ where: { id } });
    if (!category)
      throw new NotFoundException("Danh mục catalogue không tồn tại");
    if (dto.slug) {
      const found = await this.categories.findOne({
        where: { slug: dto.slug },
        withDeleted: true,
      });
      if (found && found.id !== id)
        throw new BadRequestException("Slug danh mục đã tồn tại");
    }
    await this.categories.update(id, dto);
    return this.categories.findOne({ where: { id } });
  }
  async deleteCategory(id: number) {
    const category = await this.categories.findOne({ where: { id } });
    if (!category)
      throw new NotFoundException("Danh mục catalogue không tồn tại");
    if (await this.catalogues.count({ where: { categoryId: id } }))
      throw new BadRequestException("Danh mục đang được sử dụng");
    await this.categories.softDelete(id);
    return { message: "Deleted successfully" };
  }
}
