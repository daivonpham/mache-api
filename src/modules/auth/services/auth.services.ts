import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ErrorMessage } from "src/common/constants/err";
import { DatabaseService } from "src/database/database.service";
import { Account } from "src/modules/user/entities/account.entity";
import { Profile } from "src/modules/user/entities/profile.entity";
import {
  ChangePasswordDto,
  CreateUserDto,
  LoginDto,
} from "../constants/auth.dto";
import { LoginResponse, UserResponse } from "../constants/auth.response";
import { JwtAuthService } from "./jwt.services";
import { UserToken } from "../entities/user-token.entity";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtAuthService,
    private readonly databaseService: DatabaseService,
  ) {}

  async verifyAccountExist(email: string): Promise<boolean> {
    const account = await this.databaseService
      .getRepository(Account)
      .findOne({ where: { email } });
    if (account) {
      throw new BadRequestException(ErrorMessage.ACCOUNT_ALREADY_EXISTS);
    }
    return !!account;
  }

  async saveToken(userId: number, token: string): Promise<void> {
    const userToken = await this.databaseService
      .getRepository(UserToken)
      .findOne({
        where: { userId },
      });
    if (userToken) {
      await this.databaseService.getRepository(UserToken).update(userToken.id, {
        token,
      });
    } else {
      await this.databaseService.getRepository(UserToken).save({
        userId,
        token,
      });
    }
  }

  async createAccount(dto: CreateUserDto): Promise<UserResponse> {
    const { account, profile } = dto;
    await this.verifyAccountExist(account.email);

    const hashedPassword = await this.jwtService.hashPassword(account.password);

    const savedAccount = await this.databaseService.transaction(
      async (entityManager) => {
        const accountRepository = this.databaseService.getTxRepository(
          Account,
          entityManager,
        );
        const profileRepository = this.databaseService.getTxRepository(
          Profile,
          entityManager,
        );

        const newAccount = accountRepository.create({
          email: account.email,
          password: hashedPassword,
        });
        const savedAccount = await accountRepository.save(newAccount);

        const newProfile = profileRepository.create({
          ...profile,
          accountId: savedAccount.id,
        });
        await profileRepository.save(newProfile);

        return savedAccount;
      },
    );

    return {
      id: savedAccount.id,
      email: savedAccount.email,
      name: dto.profile.name,
    };
  }

  async login(dto: LoginDto): Promise<LoginResponse> {
    const account = await this.databaseService.getRepository(Account).findOne({
      where: { email: dto.email },
      relations: ["profile"],
      select: {
        id: true,
        email: true,
        password: true,
        isActive: true,
        isSuperAdmin: true,
        profile: {
          name: true,
        },
      },
    });

    if (!account) {
      throw new UnauthorizedException(ErrorMessage.EMAIL_NOT_CORRECT);
    }

    const isPasswordValid = await this.jwtService.comparePassword(
      dto.password,
      account.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(ErrorMessage.PASSWORD_NOT_CORRECT);
    }

    if (!account.isActive) {
      throw new UnauthorizedException(ErrorMessage.ACCOUNT_IS_NOT_ACTIVE);
    }

    const payload = {
      sub: account.id,
      email: account.email,
      isSuperAdmin: account.isSuperAdmin,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.generateAccessToken(payload),
      this.jwtService.generateRefreshToken({ sub: account.id }),
    ]);

    await this.saveToken(account.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: account.id,
        email: account.email,
        name: account.profile?.name ?? "",
      },
    };
  }

  async changePassword(dto: ChangePasswordDto): Promise<UserResponse> {
    const account = await this.databaseService.getRepository(Account).findOne({
      where: { email: dto.email },
      relations: ["profile"],
      select: {
        id: true,
        email: true,
        password: true,
        isActive: true,
        isSuperAdmin: true,
        profile: {
          name: true,
        },
      },
    });
    if (!account) {
      throw new UnauthorizedException(ErrorMessage.EMAIL_NOT_CORRECT);
    }

    const isOldPasswordValid = await this.jwtService.comparePassword(
      dto.oldPassword,
      account.password,
    );
    if (!isOldPasswordValid) {
      throw new UnauthorizedException(ErrorMessage.PASSWORD_NOT_CORRECT);
    }

    if (dto.newPassword !== dto.confirmNewPassword) {
      throw new UnauthorizedException(
        ErrorMessage.CONFIRM_PASSWORD_NOT_CORRECT,
      );
    }

    const hashedPassword = await this.jwtService.hashPassword(dto.newPassword);
    await this.databaseService.getRepository(Account).update(account.id, {
      password: hashedPassword,
    });
    return {
      id: account.id,
      email: account.email,
      name: account.profile?.name ?? "",
    };
  }
}
