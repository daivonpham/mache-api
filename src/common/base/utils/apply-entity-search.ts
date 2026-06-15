import { getSearchableProperties } from "src/common/decorators/entity-meta.decorator";
import { ObjectLiteral, SelectQueryBuilder } from "typeorm";

/**
 * Áp dụng điều kiện ILIKE trên các cột được đánh dấu @Searchable() của entity.
 */
export function applyEntitySearch<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  alias: string,
  entityPrototype: object,
  search: string,
): void {
  const keyword = search.trim();
  if (!keyword) return;

  const searchableProps = getSearchableProperties(entityPrototype);
  if (!searchableProps.length) return;

  const whereConditions = searchableProps
    .map((prop) => {
      if (prop.includes(".")) {
        const parts = prop.split(".");
        const columnName = parts.pop();
        const relationPath = parts.join("__");
        return `${relationPath}.${columnName} ILIKE :search`;
      }
      return `${alias}.${prop} ILIKE :search`;
    })
    .join(" OR ");

  qb.andWhere(`(${whereConditions})`, { search: `%${keyword}%` });
}
