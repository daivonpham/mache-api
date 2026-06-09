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
  BrandQueryDto,
  CreateBrandDto,
  UpdateBrandDto,
} from "../constants/brand.dto";
import { BrandResponse } from "../constants/brand.response";
import { Brand } from "../entities/brand.entity";

const BRAND_RELATIONS = ["logoMedia"];

const BRAND_SELECT = [
  "id",
  "name",
  "slug",
  "description",
  "logoMediaId",
  "isActive",
  "createdAt",
  "updatedAt",
  "logoMedia.url",
];

@Injectable()
export class BrandService extends BaseService<Brand> {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
  ) {
    super(brandRepository);
  }

  toResponse(brand: Brand): BrandResponse {
    return {
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      description: brand.description,
      logoMediaId: brand.logoMediaId,
      logoUrl: brand.logoMedia?.url,
      isActive: brand.isActive,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
    };
  }

  private async assertLogoMedia(logoMediaId?: number): Promise<void> {
    if (logoMediaId == null) return;
    const media = await this.mediaRepository.findOne({
      where: { id: logoMediaId },
    });
    if (!media) {
      throw new BadRequestException(ErrorMessage.MEDIA_NOT_FOUND);
    }
    if (media.kind !== MediaKind.IMAGE) {
      throw new BadRequestException(ErrorMessage.PRODUCT_GALLERY_MUST_BE_IMAGE);
    }
  }

  private async findBrandOrThrow(id: number): Promise<Brand> {
    const brand = await this.brandRepository.findOne({
      where: { id },
      relations: BRAND_RELATIONS,
    });
    if (!brand) {
      throw new NotFoundException(ErrorMessage.BRAND_NOT_FOUND);
    }
    return brand;
  }

  async create(dto: CreateBrandDto): Promise<BrandResponse> {
    await this.assertLogoMedia(dto.logoMediaId);
    const brand = this.brandRepository.create(dto);
    const saved = await this.brandRepository.save(brand);
    return this.toResponse(await this.findBrandOrThrow(saved.id));
  }

  async findAll(dto: BrandQueryDto) {
    const result = await this.getAllGeneric({
      search: dto.search,
      page: dto.page,
      limit: dto.limit,
      relations: BRAND_RELATIONS,
      select: BRAND_SELECT,
    });
    return {
      ...result,
      data: result.data.map((brand) => this.toResponse(brand)),
    };
  }

  async findOne(id: number): Promise<BrandResponse> {
    return this.toResponse(await this.findBrandOrThrow(id));
  }

  async update(id: number, dto: UpdateBrandDto): Promise<BrandResponse> {
    const brand = await this.brandRepository.findOne({ where: { id } });
    if (!brand) {
      throw new NotFoundException(ErrorMessage.BRAND_NOT_FOUND);
    }
    if (dto.logoMediaId !== undefined) {
      await this.assertLogoMedia(dto.logoMediaId);
    }
    await this.brandRepository.update(id, dto);
    return this.toResponse(await this.findBrandOrThrow(id));
  }

  async delete(id: number): Promise<void> {
    const brand = await this.brandRepository.findOne({ where: { id } });
    if (!brand) {
      throw new NotFoundException(ErrorMessage.BRAND_NOT_FOUND);
    }
    await this.brandRepository.softDelete(id);
  }
}
