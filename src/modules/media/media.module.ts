import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MediaController } from "./controllers/media.controller";
import { Media } from "./entities/media.entity";
import { MediaService } from "./services/media.service";
import { StorageService } from "./services/storage.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Media]),
    MulterModule.register({
      limits: {
        // Giới hạn cứng của multer = giới hạn lớn nhất (PDF 50MB); ảnh được kiểm tra riêng trong StorageService
        fileSize: 50 * 1024 * 1024,
      },
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService, StorageService],
  exports: [MediaService, StorageService],
})
export class MediaModule {}
