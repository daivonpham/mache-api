import { Controller, Get, Version } from "@nestjs/common";
import { AppService } from "./app.service";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("app")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Version("1")
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
