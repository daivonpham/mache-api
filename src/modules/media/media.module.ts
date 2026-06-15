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
        fileSize: 10 * 1024 * 1024,
      },
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService, StorageService],
  exports: [MediaService, StorageService],
})
export class MediaModule {}
