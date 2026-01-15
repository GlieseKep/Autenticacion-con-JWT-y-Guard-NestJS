import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  contrasenia: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nombre: string;
}
