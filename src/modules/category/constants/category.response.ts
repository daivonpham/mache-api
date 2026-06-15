export class CategoryResponse {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  parentId?: number | null;
  thumbnailMediaId?: number | null;
  thumbnailUrl?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
