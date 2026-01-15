import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @MaxLength(20, {
    message: 'El tamaño máximo de la contraseña es 20 caracteres',
  })
  contrasenia: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nombre: string;
}
