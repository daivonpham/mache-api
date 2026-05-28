import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { Account } from "./account.entity";
import { Searchable } from "src/common/decorators/entity-meta.decorator";
import { BaseEntity } from "src/common/base/entities/base-entity";

@Entity("profiles")
export class Profile extends BaseEntity {
  @Searchable()
  @Column("varchar", { name: "name", length: 255 })
  name: string;

  @Column("int", { name: "account_id", nullable: true })
  accountId: number;

  @OneToOne(() => Account, (account) => account.profile)
  @JoinColumn({ name: "account_id" })
  account: Account;
}
