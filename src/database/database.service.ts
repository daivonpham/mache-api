import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, EntityTarget, ObjectLiteral, Repository } from 'typeorm';

@Injectable()
export class DatabaseService {
  constructor(private readonly dataSource: DataSource) {}

  getRepository<Entity extends ObjectLiteral>(entity: EntityTarget<Entity>): Repository<Entity> {
    return this.dataSource.getRepository(entity);
  }

  async transaction<T>(
    work: (entityManager: EntityManager) => Promise<T>,
  ): Promise<T> {
    return this.dataSource.transaction(work);
  }

  getTxRepository<Entity extends ObjectLiteral>(
    entity: EntityTarget<Entity>,
    entityManager: EntityManager,
  ): Repository<Entity> {
    return entityManager.getRepository(entity);
  }
}



