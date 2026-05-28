import { Module } from "@nestjs/common";
import { ProfileController } from "./controllers/profile.controller";
import { ProfileService } from "./services/profile.services";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Account } from "./entities/account.entity";
import { Profile } from "./entities/profile.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Account, Profile])],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class UserModule {}
