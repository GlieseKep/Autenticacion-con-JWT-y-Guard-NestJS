import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Debe ingresar un correo válido' })
  email: string;

  @IsString()
  @MinLength(1, { message: 'La contraseña es obligatoria' })
  contrasenia: string;
}
