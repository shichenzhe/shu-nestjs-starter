import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Entity } from 'src/commons/entity/entity';

/**
 * 更新用户DTO
 */
export class UserUpdateDto extends Entity {
  @IsOptional()
  @IsString({ message: '真实姓名必须是字符串' })
  name?: string;

  @IsOptional()
  @IsString({ message: '手机号必须是字符串' })
  phone?: string;

  @IsOptional()
  @ValidateIf(
    (object: UserUpdateDto) =>
      object.email !== undefined && object.email !== '',
  )
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @IsNotEmpty({ message: '用户状态不能为空' })
  isActive: boolean;

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
