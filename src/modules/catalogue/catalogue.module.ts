import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Brand } from "src/modules/brand/entities/brand.entity";
import { Media } from "src/modules/media/entities/media.entity";
import { CatalogueController } from "./controllers/catalogue.controller";
import { CatalogueCategory } from "./entities/catalogue-category.entity";
import { Catalogue } from "./entities/catalogue.entity";
import { CatalogueService } from "./services/catalogue.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Catalogue, CatalogueCategory, Brand, Media]),
  ],
  controllers: [CatalogueController],
  providers: [CatalogueService],
  exports: [CatalogueService],
})
export class CatalogueModule {}
