import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

/**
 * 更新用户DTO
 */
export class UserProfileUpdateDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString({ message: '真实姓名必须是字符串' })
  name: string;

  @IsOptional()
  @IsString({ message: '手机号必须是字符串' })
  phone?: string;

  @IsOptional()
  @ValidateIf(
    (object: UserProfileUpdateDto) =>
      object.email !== undefined && object.email !== '',
  )
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @IsOptional()
  @MaxLength(255, { message: '备注长度不能超过255位' })
  note: string;

  @IsOptional()
  @IsString({ message: '父亲姓名必须是字符串' })
  @MaxLength(50, { message: '父亲姓名长度不能超过50位' })
  parents1?: string;

  @IsOptional()
  @IsString({ message: '母亲姓名必须是字符串' })
  @MaxLength(50, { message: '母亲姓名长度不能超过50位' })
  parents2?: string;
}
