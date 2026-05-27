import { Global, Module, OnModuleInit } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { dataSourceOptions } from "./data-source";
import { DatabaseService } from "./database.service";

@Global()
@Module({
  imports: [TypeOrmModule.forRoot(dataSourceOptions)],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  onModuleInit() {
    const dbType = this.dataSource.options.type ?? "database";
    if (this.dataSource.isInitialized) {
      console.log(`✅ Kết nối Database ${dbType} thành công!`);
    } else {
      console.log(`❌ Lỗi kết nối Database ${dbType}!`);
    }
  }
}
