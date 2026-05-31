import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { QueryBaseDto } from "src/common/constants/interface";
import { MediaKind } from "../entities/media.entity";

export class MediaQueryDto extends QueryBaseDto {
  @ApiPropertyOptional({ enum: MediaKind })
  @IsOptional()
  @IsEnum(MediaKind)
  kind?: MediaKind;
}

export class UploadMediaDto {
  @ApiPropertyOptional({ description: "Alt text cho SEO" })
  @IsOptional()
  @IsString()
  alt?: string;
}
