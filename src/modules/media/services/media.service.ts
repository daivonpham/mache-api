import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseService } from "src/common/base/services/base-service";
import { ErrorMessage } from "src/common/constants/err";
import { Repository } from "typeorm";
import { MediaQueryDto } from "../constants/media.dto";
import { MediaResponse } from "../constants/media.response";
import { UploadedFile } from "../constants/uploaded-file";
import { Media } from "../entities/media.entity";
import { StorageService } from "./storage.service";

@Injectable()
export class MediaService extends BaseService<Media> {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    private readonly storageService: StorageService,
  ) {
    super(mediaRepository);
  }

  async upload(
    file: UploadedFile,
    uploadedBy?: number,
    alt?: string,
  ): Promise<MediaResponse> {
    const stored = await this.storageService.save(file);

    const media = this.mediaRepository.create({
      originalName: file.originalname,
      fileName: stored.fileName,
      path: stored.path,
      url: stored.url,
      mimeType: file.mimetype,
      size: file.size,
      kind: stored.kind,
      alt,
      uploadedBy,
      isActive: true,
    });

    const saved = await this.mediaRepository.save(media);
    return this.toResponse(saved);
  }

  async uploadMany(
    files: UploadedFile[],
    uploadedBy?: number,
  ): Promise<MediaResponse[]> {
    const results: MediaResponse[] = [];
    for (const file of files) {
      results.push(await this.upload(file, uploadedBy));
    }
    return results;
  }

  async findAll(dto: MediaQueryDto) {
    const { page, limit, search, sortBy, sort, fromDate, toDate, kind } = dto;

    return this.getAllGeneric({
      page,
      limit,
      search,
      sortBy: sortBy ?? "createdAt",
      sort,
      fromDate,
      toDate,
      filter: kind ? { kind } : undefined,
      select: [
        "id",
        "originalName",
        "fileName",
        "path",
        "url",
        "mimeType",
        "size",
        "kind",
        "alt",
        "uploadedBy",
        "createdAt",
      ],
    });
  }

  async findOne(id: number): Promise<MediaResponse> {
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) {
      throw new NotFoundException(ErrorMessage.MEDIA_NOT_FOUND);
    }
    return this.toResponse(media);
  }

  async remove(id: number): Promise<void> {
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) {
      throw new NotFoundException(ErrorMessage.MEDIA_NOT_FOUND);
    }

    await this.storageService.delete(media.path);
    await this.mediaRepository.softRemove(media);
  }

  toResponse(media: Media): MediaResponse {
    return {
      id: media.id,
      originalName: media.originalName,
      fileName: media.fileName,
      path: media.path,
      url: media.url,
      mimeType: media.mimeType,
      size: media.size,
      kind: media.kind,
      alt: media.alt,
      uploadedBy: media.uploadedBy,
      createdAt: media.createdAt,
    };
  }
}
