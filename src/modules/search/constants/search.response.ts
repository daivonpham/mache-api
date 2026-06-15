import { SearchResourceType } from "./search.types";

export class SearchPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export class SearchHitResponse {
  type: SearchResourceType;
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  url?: string | null;
}

export class SearchGroupResponse {
  data: SearchHitResponse[];
  metadata: SearchPaginationMeta;
}

export class GlobalSearchResponse {
  query: string;
  products?: SearchGroupResponse;
  blogPosts?: SearchGroupResponse;
  productReviews?: SearchGroupResponse;
}
