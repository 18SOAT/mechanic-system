import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

// TODO: swagger — @ApiProperty com exemplos em cada campo.
export class LoginRequestDto {
  @IsEmail({}, { message: 'E-mail inválido.' })
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
