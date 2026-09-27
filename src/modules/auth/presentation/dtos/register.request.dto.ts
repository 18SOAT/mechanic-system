import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsCpfCnpj } from '../../../customer/presentation/validators/is-cpf-cnpj.decorator.js';

// TODO: swagger — @ApiProperty com exemplos em cada campo.
export class RegisterRequestDto {
  @IsEmail({}, { message: 'E-mail inválido.' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres.' })
  @MaxLength(72, { message: 'A senha deve ter no máximo 72 caracteres.' })
  password: string;

  @IsCpfCnpj()
  document: string;

  @Matches(/^\D*(\d\D*){10,11}$/, {
    message: 'Telefone inválido. Informe DDD + número.',
  })
  phone: string;
}
