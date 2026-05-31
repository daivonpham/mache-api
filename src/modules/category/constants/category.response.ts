export class CategoryResponse {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  parentId?: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
