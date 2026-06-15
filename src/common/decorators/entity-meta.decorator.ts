import "reflect-metadata";

export const SEARCHABLE_KEY = "custom:searchable";
export const SORTABLE_KEY = "custom:sortable";

function getOwnMetadataStringArray(key: string, target: object): string[] {
  const metadata: unknown = Reflect.getOwnMetadata(key, target);
  if (!Array.isArray(metadata)) {
    return [];
  }
  return metadata.filter((item): item is string => typeof item === "string");
}

/**
 * Đánh dấu một thuộc tính trong Entity có thể được dùng để tìm kiếm (LIKE %search%)
 */
export function Searchable(relationFields?: string[]): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const existingSearchableProps = getOwnMetadataStringArray(
      SEARCHABLE_KEY,
      target,
    );

    if (relationFields && relationFields.length > 0) {
      const relatedProps = relationFields.map(
        (field) => `${String(propertyKey)}.${field}`,
      );
      Reflect.defineMetadata(
        SEARCHABLE_KEY,
        [...existingSearchableProps, ...relatedProps],
        target,
      );
    } else {
      Reflect.defineMetadata(
        SEARCHABLE_KEY,
        [...existingSearchableProps, propertyKey],
        target,
      );
    }
  };
}

/**
 * Đánh dấu một thuộc tính trong Entity có thể được dùng để sắp xếp (ORDER BY ASC/DESC)
 */
export function Sortable(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const existingSortableProps = getOwnMetadataStringArray(
      SORTABLE_KEY,
      target,
    );
    Reflect.defineMetadata(
      SORTABLE_KEY,
      [...existingSortableProps, propertyKey],
      target,
    );
  };
}

/**
 * Hàm hỗ trợ lấy tất cả các thuộc tính được đánh dấu là @Searchable()
 * Bao gồm cả các thuộc tính được kế thừa từ class cha (ví dụ: BaseEntity)
 */
export function getSearchableProperties(targetPrototype: object): string[] {
  let props: string[] = [];
  let currentTarget: object | null = targetPrototype;

  while (currentTarget && currentTarget !== Object.prototype) {
    props = [
      ...props,
      ...getOwnMetadataStringArray(SEARCHABLE_KEY, currentTarget),
    ];
    currentTarget = Object.getPrototypeOf(currentTarget) as object | null;
  }

  return [...new Set(props)];
}

/**
 * Hàm hỗ trợ lấy tất cả các thuộc tính được đánh dấu là @Sortable()
 * Bao gồm cả các thuộc tính được kế thừa từ class cha
 */
export function getSortableProperties(targetPrototype: object): string[] {
  let props: string[] = [];
  let currentTarget: object | null = targetPrototype;

  while (currentTarget && currentTarget !== Object.prototype) {
    props = [
      ...props,
      ...getOwnMetadataStringArray(SORTABLE_KEY, currentTarget),
    ];
    currentTarget = Object.getPrototypeOf(currentTarget) as object | null;
  }

  return [...new Set(props)];
}
