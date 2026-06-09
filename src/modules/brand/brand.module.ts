import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Media } from "src/modules/media/entities/media.entity";
import { BrandController } from "./controllers/brand.controller";
import { Brand } from "./entities/brand.entity";
import { BrandService } from "./services/brand.service";

@Module({
  imports: [TypeOrmModule.forFeature([Brand, Media])],
  controllers: [BrandController],
  providers: [BrandService],
  exports: [BrandService],
})
export class BrandModule {}
