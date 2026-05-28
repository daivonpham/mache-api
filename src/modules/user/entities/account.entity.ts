import { BaseEntity } from "src/common/base/entities/base-entity";
import { Column, Entity, OneToOne, Unique } from "typeorm";
import { Profile } from "./profile.entity";

@Entity("accounts")
@Unique(["email"])
export class Account extends BaseEntity {
  @Column("varchar", { name: "email", length: 80 })
  email: string;

  @Column("varchar", { name: "password", length: 255 })
  password: string;

  @Column("boolean", { name: "is_super_admin", default: false })
  isSuperAdmin: boolean;

  @OneToOne(() => Profile, (profile) => profile.account)
  profile: Profile;
}
