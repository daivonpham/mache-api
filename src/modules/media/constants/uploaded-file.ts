import { BadRequestException } from "@nestjs/common";
import { ErrorMessage } from "src/common/constants/err";

export interface UploadedFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export function toUploadedFile(file: unknown): UploadedFile {
  if (!file || typeof file !== "object") {
    throw new BadRequestException(ErrorMessage.FILE_REQUIRED);
  }

  const candidate = file as Record<string, unknown>;

  if (
    typeof candidate.originalname !== "string" ||
    typeof candidate.mimetype !== "string" ||
    typeof candidate.size !== "number" ||
    !Buffer.isBuffer(candidate.buffer)
  ) {
    throw new BadRequestException(ErrorMessage.FILE_REQUIRED);
  }

  return {
    originalname: candidate.originalname,
    mimetype: candidate.mimetype,
    size: candidate.size,
    buffer: candidate.buffer,
  };
}

export function toUploadedFiles(files: unknown): UploadedFile[] {
  if (!Array.isArray(files)) {
    return [];
  }

  return files.map((file) => toUploadedFile(file));
}
