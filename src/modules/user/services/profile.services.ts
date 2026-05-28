import { Repository } from "typeorm";
import { Profile } from "../entities/profile.entity";
import { BaseService } from "src/common/base/services/base-service";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ProfileQueryDto } from "../constants/user.dto";

@Injectable()
export class ProfileService extends BaseService<Profile> {
  constructor(
    @InjectRepository(Profile)
    profileRepository: Repository<Profile>,
  ) {
    super(profileRepository);
  }

  async getListProfile(dto: ProfileQueryDto) {
    const {
      page,
      limit,
      search,
      sortBy,
      sort,
      fromDate,
      toDate,
      ...customFilters
    } = dto;
    return await this.getAllGeneric({
      page,
      limit,
      search,
      sortBy,
      sort,
      fromDate,
      toDate,
      select: ["id", "name"],
      filter: Object.keys(customFilters).length > 0 ? customFilters : undefined,
    });
  }
}
