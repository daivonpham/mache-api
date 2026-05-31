import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MulterModule } from "@nestjs/platform-express";
import { ServeStaticModule } from "@nestjs/serve-static";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";
import { AuthModule } from "@modules/auth/auth.module";
import { MediaController } from "./controllers/media.controller";
import { Media } from "./entities/media.entity";
import { MediaService } from "./services/media.service";
import { StorageService } from "./services/storage.service";

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Media]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        limits: {
          fileSize: 10 * 1024 * 1024,
        },
      }),
    }),
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          rootPath: join(
            process.cwd(),
            configService.get<string>("upload.dir", "storages/uploads"),
          ),
          serveRoot: "/uploads",
          serveStaticOptions: {
            index: false,
          },
        },
      ],
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService, StorageService],
  exports: [MediaService, StorageService],
})
export class MediaModule {}
