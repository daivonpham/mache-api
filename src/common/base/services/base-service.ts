import { GetAllGenericOptions } from "src/common/constants/interface";
import {
  getSearchableProperties,
  getSortableProperties,
} from "src/common/decorators/entity-meta.decorator";
import { ObjectLiteral, Repository } from "typeorm";

export class BaseService<Entity extends ObjectLiteral> {
  constructor(protected readonly repository: Repository<Entity>) {}

  // async getAllGeneric(options: GetAllGenericOptions): Promise<{
  //   data: Entity[];
  //   metadata: {
  //     page: number;
  //     limit: number;
  //     total: number;
  //     totalPage: number;
  //   };
  // }> {
  //   if (!options.filter) {
  //     options.filter = {};
  //   }

  //   const standaloneFilters = [
  //     'search',
  //     'searchBy',
  //     'sortBy',
  //     'sort',
  //     'fromDate',
  //     'toDate',
  //   ];
  //   standaloneFilters.forEach((key) => {
  //     if (options[key as keyof GetAllGenericOptions] !== undefined) {
  //       options.filter![key] = options[key as keyof GetAllGenericOptions];
  //     }
  //   });

  //   if (options.filter.isActive === undefined) {
  //     options.filter.isActive = true;
  //   }
  //   if (options.filter.isDeleted === undefined) {
  //     options.filter.isDeleted = null;
  //   }

  //   const qb = this.repository.createQueryBuilder('alias');
  //   const alias = qb.alias;
  //   const entityPrototype = (this.repository.target as Function).prototype;

  //   const {
  //     search,
  //     searchBy,
  //     sortBy,
  //     sort,
  //     fromDate,
  //     toDate,
  //     ...actualFilters
  //   } = options.filter;

  //   Object.entries(actualFilters).forEach(([key, value]) => {
  //     if (value === null || value === undefined || value === '') return;

  //     if (key === 'isDeleted') {
  //       if (String(value) === 'true') {
  //         qb.withDeleted().andWhere(`${alias}.deletedAt IS NOT NULL`);
  //       } else if (String(value) === 'false') {
  //         qb.andWhere(`${alias}.deletedAt IS NULL`);
  //       }
  //       return;
  //     }

  //     const paramName = `filter_${key}`;
  //     if (Array.isArray(value)) {
  //       qb.andWhere(`${alias}.${key} IN (:${paramName})`, {
  //         [paramName]: value,
  //       });
  //     } else {
  //       qb.andWhere(`${alias}.${key} = :${paramName}`, { [paramName]: value });
  //     }
  //   });

  //   if (search) {
  //     const searchableProps =
  //       searchBy && searchBy.length > 0
  //         ? searchBy
  //         : getSearchableProperties(entityPrototype);

  //     if (searchableProps.length > 0) {
  //       const whereConditions = searchableProps
  //         .map((prop) => {
  //           if (prop.includes('.')) {
  //             const parts = prop.split('.');
  //             // relationPath would be something like 'customer', or 'parent__child' for deep relations
  //             const relationPath = parts.slice(0, -1).join('__');
  //             const columnName = parts[parts.length - 1];

  //             // Automatically add relation to options.relations if not present
  //             const originalRelationName = parts.slice(0, -1).join('.');
  //             if (!options.relations) {
  //               options.relations = [];
  //             }
  //             if (!options.relations.includes(originalRelationName)) {
  //               options.relations.push(originalRelationName);
  //             }

  //             return `${relationPath}.${columnName} LIKE :search`;
  //           }
  //           return `${alias}.${prop} LIKE :search`;
  //         })
  //         .join(' OR ');

  //       qb.andWhere(`(${whereConditions})`, { search: `%${search}%` });
  //     }
  //   }

  //   const dateCol = options.dateColumn || 'createdAt';
  //   if (fromDate && toDate) {
  //     qb.andWhere(`${alias}.${dateCol} BETWEEN :fromDate AND :toDate`, {
  //       fromDate: fromDate,
  //       toDate: toDate,
  //     });
  //   } else if (fromDate) {
  //     qb.andWhere(`${alias}.${dateCol} >= :fromDate`, {
  //       fromDate: fromDate,
  //     });
  //   } else if (toDate) {
  //     qb.andWhere(`${alias}.${dateCol} <= :toDate`, { toDate: toDate });
  //   }

  //   if (sortBy) {
  //     const sortableProps = getSortableProperties(entityPrototype);

  //     const isValidSort =
  //       sortableProps.length === 0 || sortableProps.includes(sortBy);

  //     if (isValidSort) {
  //       const order = sort?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  //       qb.orderBy(`${alias}.${sortBy}`, order);
  //     }
  //   } else {
  //     qb.orderBy(`${alias}.createdAt`, 'DESC');
  //   }

  //   // ✅ Fix: tách leftJoin riêng, không lồng nhau
  //   if (options.relations && options.relations.length > 0) {
  //     options.relations.forEach((relation) => {
  //       if (relation.includes('.')) {
  //         const parts = relation.split('.');
  //         const parentAlias = parts[parts.length - 2];
  //         const childProp = parts[parts.length - 1];
  //         const childAlias = parts.join('__');
  //         qb.leftJoin(`${parentAlias}.${childProp}`, childAlias);
  //       } else {
  //         qb.leftJoin(`${alias}.${relation}`, relation);
  //       }
  //     });
  //   }

  //   // ✅ Fix: phân biệt relation alias vs column khi select
  //   const relationAliases = new Set(
  //     (options.relations || []).map((r) =>
  //       r.includes('.') ? r.split('.').join('__') : r,
  //     ),
  //   );

  //   if (options.select && options.select.length > 0) {
  //     const selects = options.select
  //       .filter(
  //         (field) =>
  //           !(options.relations || []).includes(field) &&
  //           !relationAliases.has(field),
  //       )
  //       .map((field) => {
  //         if (field.includes('.')) {
  //           const parts = field.split('.');
  //           const columnName = parts.pop();
  //           const relationPath = parts.join('__');
  //           return `${relationPath}.${columnName}`;
  //         }
  //         return `${alias}.${field}`;
  //       });
  //     qb.select(selects);

  //     (options.relations || []).forEach((relation) => {
  //       const relAlias = relation.includes('.')
  //         ? relation.split('.').join('__')
  //         : relation;
  //       if (
  //         options.select!.includes(relation) ||
  //         options.select!.includes(relAlias)
  //       ) {
  //         qb.addSelect(relAlias);
  //       }
  //     });
  //   } else {
  //     qb.select([alias]);

  //     relationAliases.forEach((relAlias) => {
  //       qb.addSelect(relAlias);
  //     });
  //   }

  //   const page = Number(options.page) > 0 ? Number(options.page) : 1;
  //   const limit = Number(options.limit) > 0 ? Number(options.limit) : 10;
  //   qb.skip((page - 1) * limit).take(limit);
  //   const [data, total] = await qb.getManyAndCount();
  //   const totalPage = Math.ceil(total / limit);
  //   return {
  //     data,
  //     metadata: {
  //       page: Number(page),
  //       limit: Number(limit),
  //       total: Number(total),
  //       totalPage: Number(totalPage),
  //     },
  //   };
  // }

  async getAllGeneric(options: GetAllGenericOptions): Promise<{
    data: Entity[];
    metadata: {
      page: number;
      limit: number;
      total: number;
      totalPage: number;
    };
  }> {
    if (!options.filter) {
      options.filter = {};
    }

    const standaloneFilters = [
      "search",
      "searchBy",
      "sortBy",
      "sort",
      "fromDate",
      "toDate",
    ];
    standaloneFilters.forEach((key) => {
      if (options[key as keyof GetAllGenericOptions] !== undefined) {
        options.filter![key] = options[key as keyof GetAllGenericOptions];
      }
    });

    if (options.filter.isActive === undefined) {
      options.filter.isActive = true;
    }
    if (options.filter.isDeleted === undefined) {
      options.filter.isDeleted = null;
    }

    const qb = this.repository.createQueryBuilder("alias");
    const alias = qb.alias;
    const entityPrototype = (this.repository.target as Function).prototype;

    const {
      search,
      searchBy,
      sortBy,
      sort,
      fromDate,
      toDate,
      ...actualFilters
    } = options.filter;

    if (options.relations && options.relations.length > 0) {
      options.relations.forEach((relation) => {
        if (relation.includes(".")) {
          const parts = relation.split(".");
          const parentAlias = parts.slice(0, -1).join("__");
          const childProp = parts[parts.length - 1];
          const childAlias = parts.join("__");
          qb.leftJoin(`${parentAlias}.${childProp}`, childAlias);
        } else {
          qb.leftJoin(`${alias}.${relation}`, relation);
        }
      });
    }

    if (options.count && options.count.length > 0) {
      options.count.forEach((countRel) => {
        if (countRel.includes(".")) {
          const parts = countRel.split(".");
          const childProp = parts.pop();

          if (!options.relations) {
            options.relations = [];
          }

          for (let i = 0; i < parts.length; i++) {
            const currentRelation = parts.slice(0, i + 1).join(".");
            if (!options.relations.includes(currentRelation)) {
              options.relations.push(currentRelation);
              if (i === 0) {
                qb.leftJoin(`${alias}.${parts[0]}`, parts[0]);
              } else {
                const parentAlias = parts.slice(0, i).join("__");
                const childPropName = parts[i];
                const childAlias = parts.slice(0, i + 1).join("__");
                qb.leftJoin(`${parentAlias}.${childPropName}`, childAlias);
              }
            }
          }

          const parentAlias = parts.join("__");
          qb.loadRelationCountAndMap(
            `${parentAlias}.${childProp}Count`,
            `${parentAlias}.${childProp}`,
          );
        } else {
          qb.loadRelationCountAndMap(
            `${alias}.${countRel}Count`,
            `${alias}.${countRel}`,
          );
        }
      });
    }

    Object.entries(actualFilters).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") return;

      if (key === "isDeleted") {
        if (String(value) === "true") {
          qb.withDeleted().andWhere(`${alias}.deletedAt IS NOT NULL`);
        } else if (String(value) === "false") {
          qb.andWhere(`${alias}.deletedAt IS NULL`);
        }
        return;
      }

      const paramName = `filter_${key}`;
      if (Array.isArray(value)) {
        qb.andWhere(`${alias}.${key} IN (:...${paramName})`, {
          [paramName]: value,
        });
      } else {
        qb.andWhere(`${alias}.${key} = :${paramName}`, { [paramName]: value });
      }
    });

    if (search) {
      const searchableProps =
        searchBy && searchBy.length > 0
          ? searchBy
          : getSearchableProperties(entityPrototype);

      if (searchableProps.length > 0) {
        const whereConditions = searchableProps
          .map((prop) => {
            if (prop.includes(".")) {
              const parts = prop.split(".");
              const columnName = parts.pop();

              if (!options.relations) {
                options.relations = [];
              }

              for (let i = 0; i < parts.length; i++) {
                const currentRelation = parts.slice(0, i + 1).join(".");
                if (!options.relations.includes(currentRelation)) {
                  options.relations.push(currentRelation);
                  if (i === 0) {
                    qb.leftJoin(`${alias}.${parts[0]}`, parts[0]);
                  } else {
                    const parentAlias = parts.slice(0, i).join("__");
                    const childProp = parts[i];
                    const childAlias = parts.slice(0, i + 1).join("__");
                    qb.leftJoin(`${parentAlias}.${childProp}`, childAlias);
                  }
                }
              }

              const relationPath = parts.join("__");
              return `${relationPath}.${columnName} ILIKE :search`;
            }
            return `${alias}.${prop} ILIKE :search`;
          })
          .join(" OR ");

        qb.andWhere(`(${whereConditions})`, { search: `%${search}%` });
      }
    }

    const dateCol = options.dateColumn || "createdAt";
    if (fromDate && toDate) {
      qb.andWhere(
        `${alias}.${dateCol} BETWEEN :fromDate::timestamptz AND :toDate::timestamptz`,
        { fromDate, toDate },
      );
    } else if (fromDate) {
      qb.andWhere(`${alias}.${dateCol} >= :fromDate::timestamptz`, {
        fromDate,
      });
    } else if (toDate) {
      qb.andWhere(`${alias}.${dateCol} <= :toDate::timestamptz`, { toDate });
    }

    if (sortBy) {
      const sortableProps = getSortableProperties(entityPrototype);
      const isValidSort =
        sortableProps.length === 0 || sortableProps.includes(sortBy);

      if (isValidSort) {
        const order = sort?.toUpperCase() === "DESC" ? "DESC" : "ASC";
        qb.orderBy(`${alias}.${sortBy}`, order);
      }
    } else {
      qb.orderBy(`${alias}.createdAt`, "DESC");
    }

    const relationAliases = new Set(
      (options.relations || []).map((r) =>
        r.includes(".") ? r.split(".").join("__") : r,
      ),
    );

    if (options.select && options.select.length > 0) {
      const selects = options.select
        .filter(
          (field) =>
            !(options.relations || []).includes(field) &&
            !relationAliases.has(field),
        )
        .map((field) => {
          if (field.includes(".")) {
            const parts = field.split(".");
            const columnName = parts.pop();
            const relationPath = parts.join("__");
            return `${relationPath}.${columnName}`;
          }
          return `${alias}.${field}`;
        });
      qb.select(selects);

      (options.relations || []).forEach((relation) => {
        const relAlias = relation.includes(".")
          ? relation.split(".").join("__")
          : relation;
        if (
          options.select!.includes(relation) ||
          options.select!.includes(relAlias)
        ) {
          qb.addSelect(relAlias);
        }
      });
    } else {
      qb.select([alias]);
      relationAliases.forEach((relAlias) => {
        qb.addSelect(relAlias);
      });
    }

    const page = Number(options.page) > 0 ? Number(options.page) : 1;
    const limit = Number(options.limit) > 0 ? Number(options.limit) : 10;
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    const totalPage = Math.ceil(total / limit);

    return {
      data,
      metadata: {
        page: Number(page),
        limit: Number(limit),
        total: Number(total),
        totalPage: Number(totalPage),
      },
    };
  }
}
