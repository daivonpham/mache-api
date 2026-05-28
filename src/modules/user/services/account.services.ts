import { Injectable } from "@nestjs/common";
import { BaseService } from "src/common/base/services/base-service";
import { Repository } from "typeorm";
import { Account } from "../entities/account.entity";

@Injectable()
export class AccountService extends BaseService<Account> {
  constructor(public readonly accountRepository: Repository<Account>) {
    super(accountRepository);
  }

  async getListAccounts(queryDto: any) {
    return await this.getAllGeneric({
      relations: ["profile"],

      select: ["id", "email", "profile.id", "profile.name"],
    });
  }
}
