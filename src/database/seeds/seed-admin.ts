import * as bcrypt from "bcrypt";
import configuration from "../../config/configuration";
import dataSource from "../data-source";
import { Account } from "../../modules/user/entities/account.entity";
import { Profile } from "../../modules/user/entities/profile.entity";

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_NAME = "Super Admin";
const DEFAULT_PASSWORD = "Admin@123456";

async function seedAdmin(): Promise<void> {
  const password = process.env.ADMIN_SEED_PASSWORD ?? DEFAULT_PASSWORD;
  const config = configuration();

  await dataSource.initialize();

  const accountRepository = dataSource.getRepository(Account);
  const profileRepository = dataSource.getRepository(Profile);

  const existing = await accountRepository.findOne({
    where: { email: ADMIN_EMAIL },
    relations: ["profile"],
  });

  const hashedPassword = await bcrypt.hash(password, config.jwt.saltRounds);

  if (existing) {
    await accountRepository.update(existing.id, {
      password: hashedPassword,
      isSuperAdmin: true,
      isActive: true,
    });

    if (existing.profile) {
      await profileRepository.update(existing.profile.id, { name: ADMIN_NAME });
    } else {
      await profileRepository.save(
        profileRepository.create({
          name: ADMIN_NAME,
          accountId: existing.id,
        }),
      );
    }

    console.log(`✅ Admin đã tồn tại — cập nhật full quyền: ${ADMIN_EMAIL}`);
    console.log(`   Mật khẩu: ${password}`);
    return;
  }

  await dataSource.transaction(async (entityManager) => {
    const account = await entityManager.save(
      accountRepository.create({
        email: ADMIN_EMAIL,
        password: hashedPassword,
        isSuperAdmin: true,
        isActive: true,
      }),
    );

    await entityManager.save(
      profileRepository.create({
        name: ADMIN_NAME,
        accountId: account.id,
      }),
    );
  });

  console.log(`✅ Tạo admin thành công: ${ADMIN_EMAIL}`);
  console.log(`   Mật khẩu: ${password}`);
}

seedAdmin()
  .catch((error: unknown) => {
    console.error("❌ Seed admin thất bại:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });
