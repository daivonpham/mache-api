import { MediaKind } from "../entities/media.entity";

export class MediaResponse {
  id: number;
  originalName: string;
  fileName: string;
  path: string;
  url: string;
  mimeType: string;
  size: number;
  kind: MediaKind;
  alt?: string;
  uploadedBy?: number;
  createdAt: Date;
}
