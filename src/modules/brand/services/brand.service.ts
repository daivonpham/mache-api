import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseService } from "src/common/base/services/base-service";
import { ErrorMessage } from "src/common/constants/err";
import { Repository } from "typeorm";
import {
  BrandQueryDto,
  CreateBrandDto,
  UpdateBrandDto,
} from "../constants/brand.dto";
import { BrandResponse } from "../constants/brand.response";
import { Brand } from "../entities/brand.entity";

@Injectable()
export class BrandService extends BaseService<Brand> {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {
    super(brandRepository);
  }

  toResponse(brand: Brand): BrandResponse {
    return {
      id: brand.id,
      name: brand.name,
      description: brand.description,
      logo: brand.logo,
      isActive: brand.isActive,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
    };
  }

  async create(dto: CreateBrandDto): Promise<BrandResponse> {
    const brand = this.brandRepository.create(dto);
    const saved = await this.brandRepository.save(brand);
    return this.toResponse(saved);
  }

  async findAll(dto: BrandQueryDto) {
    return this.getAllGeneric({
      search: dto.search,
      page: dto.page,
      limit: dto.limit,
      select: [
        "id",
        "name",
        "description",
        "logo",
        "isActive",
        "createdAt",
        "updatedAt",
      ],
    });
  }

  async findOne(id: number): Promise<BrandResponse> {
    const brand = await this.brandRepository.findOne({ where: { id } });
    if (!brand) {
      throw new NotFoundException(ErrorMessage.BRAND_NOT_FOUND);
    }
    return this.toResponse(brand);
  }

  async update(id: number, dto: UpdateBrandDto): Promise<BrandResponse> {
    const brand = await this.brandRepository.findOne({ where: { id } });
    if (!brand) {
      throw new NotFoundException(ErrorMessage.BRAND_NOT_FOUND);
    }
    await this.brandRepository.update(id, dto);
    const updated = await this.brandRepository.findOne({ where: { id } });
    return this.toResponse(updated!);
  }

  async delete(id: number): Promise<void> {
    const brand = await this.brandRepository.findOne({ where: { id } });
    if (!brand) {
      throw new NotFoundException(ErrorMessage.BRAND_NOT_FOUND);
    }
    await this.brandRepository.softDelete(id);
  }
}
