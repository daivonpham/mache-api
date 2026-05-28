import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity("user_token")
export class UserToken {
  @PrimaryGeneratedColumn("increment", { type: "int" })
  id: number;

  @Index()
  @Column({ name: "user_id" })
  userId: number;

  @Column({ name: "token", length: 255 })
  token: string;
}
