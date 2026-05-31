import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Brand } from "src/modules/brand/entities/brand.entity";
import { Category } from "src/modules/category/entities/category.entity";
import { Media } from "src/modules/media/entities/media.entity";
import { ProductController } from "./controllers/product.controller";
import { ProductImage } from "./entities/product-image.entity";
import { Product } from "./entities/product.entity";
import { ProductService } from "./services/product.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage, Category, Brand, Media]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
