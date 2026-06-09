import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Auth } from "src/common/decorators/auth.decorator";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import type { JwtPayload } from "src/common/constants/interface";
import { MediaQueryDto, UploadMediaDto } from "../constants/media.dto";
import { MediaResponse } from "../constants/media.response";
import { MediaService } from "../services/media.service";

@Controller("media")
@ApiTags("Media")
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post("upload")
  @Auth()
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: { type: "string", format: "binary" },
        alt: { type: "string" },
      },
      required: ["file"],
    },
  })
  @UseInterceptors(FileInterceptor("file"))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadMediaDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<MediaResponse> {
    return this.mediaService.upload(file, user.sub, dto.alt);
  }

  @Post("upload/multiple")
  @Auth()
  @ApiOperation({ summary: "Upload nhiều file" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        files: {
          type: "array",
          items: { type: "string", format: "binary" },
        },
      },
      required: ["files"],
    },
  })
  @UseInterceptors(FilesInterceptor("files", 10))
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: JwtPayload,
  ): Promise<MediaResponse[]> {
    return this.mediaService.uploadMany(files ?? [], user.sub);
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: "Danh sách thư viện media" })
  async findAll(@Query() dto: MediaQueryDto) {
    return this.mediaService.findAll(dto);
  }

  @Get(":id")
  @Auth()
  @ApiOperation({ summary: "Chi tiết media" })
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<MediaResponse> {
    return this.mediaService.findOne(id);
  }

  @Delete(":id")
  @Auth()
  @ApiOperation({ summary: "Xóa media (file + soft delete DB)" })
  async remove(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.mediaService.remove(id);
    return { message: "Deleted successfully" };
  }
}
