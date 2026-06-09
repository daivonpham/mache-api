export class BrandResponse {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logoMediaId: number;
  logoUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
