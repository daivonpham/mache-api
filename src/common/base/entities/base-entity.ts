import { Sortable } from 'src/common/decorators/entity-meta.decorator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class BaseEntity {
  @PrimaryGeneratedColumn('increment', { type: 'int' })
  id: number;

  @Column('boolean', { name: 'is_active', default: true })
  isActive: boolean;

  @Sortable()
  @Index()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}

export class BaseEntityWithExtra extends BaseEntity {
  @Column('json', { name: 'extra', nullable: true })
  extra?: Record<string, any>;
}
