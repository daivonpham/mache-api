/** SEO metadata — cùng shape với product để tái sử dụng pattern */
export interface BlogSeo {
  title?: string;
  description?: string;
  keywords?: string;
}

export enum BlogPublishStatus {
  DRAFT = "draft",
  SCHEDULED = "scheduled",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}
