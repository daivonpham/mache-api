import { QueryBaseDto } from "src/common/constants/interface";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";

export class ProfileQueryDto extends QueryBaseDto {
  @ApiPropertyOptional({ description: "Trạng thái profile" })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "true")
  isActive?: boolean;
}
