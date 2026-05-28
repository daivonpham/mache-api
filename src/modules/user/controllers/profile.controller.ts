import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ProfileQueryDto } from "../constants/user.dto";
import { ProfileService } from "../services/profile.services";

@Controller("profiles")
@ApiTags("Profile")
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getListProfile(@Query() dto: ProfileQueryDto) {
    return await this.profileService.getListProfile(dto);
  }
}
