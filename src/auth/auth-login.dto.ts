import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  readonly password: string;
}
