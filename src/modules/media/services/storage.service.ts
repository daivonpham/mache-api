import {
  BadRequestException,
  Injectable,
  PayloadTooLargeException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { mkdir, unlink, writeFile } from "fs/promises";
import { extname, join } from "path";
import { randomUUID } from "crypto";
import { ErrorMessage } from "src/common/constants/err";
import { UploadedFile } from "../constants/uploaded-file";
import { MediaKind } from "../entities/media.entity";

interface UploadConfig {
  dir: string;
}

@Injectable()
export class StorageService {
  constructor(private readonly configService: ConfigService) {}

  private get uploadConfig(): UploadConfig {
    return this.configService.get<UploadConfig>("upload")!;
  }

  private readonly maxSize = 10 * 1024 * 1024; // 10MB
  private readonly allowedMime = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
  ]);

  getUploadRoot(): string {
    return join(process.cwd(), this.uploadConfig.dir);
  }

  validateFile(file?: UploadedFile): void {
    if (!file) {
      throw new BadRequestException(ErrorMessage.FILE_REQUIRED);
    }

    if (file.size > this.maxSize) {
      throw new PayloadTooLargeException(ErrorMessage.FILE_TOO_LARGE);
    }

    if (!this.allowedMime.has(file.mimetype)) {
      throw new BadRequestException(ErrorMessage.INVALID_FILE_TYPE);
    }
  }

  resolveKind(mimeType: string): MediaKind {
    if (mimeType.startsWith("image/")) {
      return MediaKind.IMAGE;
    }
    return MediaKind.DOCUMENT;
  }

  async save(
    file: UploadedFile,
  ): Promise<{ path: string; fileName: string; url: string; kind: MediaKind }> {
    this.validateFile(file);

    const kind = this.resolveKind(file.mimetype);
    const subdir = kind === MediaKind.IMAGE ? "images" : "documents";
    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const ext =
      extname(file.originalname).toLowerCase() ||
      this.extFromMime(file.mimetype);
    const fileName = `${randomUUID()}${ext}`;
    const relativePath = `${subdir}/${year}/${month}/${fileName}`;
    const absoluteDir = join(this.getUploadRoot(), subdir, year, month);
    const absolutePath = join(absoluteDir, fileName);

    await mkdir(absoluteDir, { recursive: true });
    await writeFile(absolutePath, file.buffer);

    const url = `/uploads/${relativePath}`;

    return { path: relativePath, fileName, url, kind };
  }

  async delete(relativePath: string): Promise<void> {
    const absolutePath = join(this.getUploadRoot(), relativePath);
    try {
      await unlink(absolutePath);
    } catch {
      // File may already be removed from disk
    }
  }

  private extFromMime(mimeType: string): string {
    const map: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/gif": ".gif",
      "application/pdf": ".pdf",
    };
    return map[mimeType] ?? "";
  }
}
