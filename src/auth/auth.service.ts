import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * REGISTRO DE USUARIO
   * 1. Verifica que el email no exista
   * 2. Hashea la contraseña
   * 3. Crea el usuario
   * 4. Retorna usuario sin contraseña
   * 5. algo mas? esta bien este algoritmo?
   */
  async register(registerDto: RegisterDto) {
    const { email, contrasenia, nombre } = registerDto;

    // 1. Verificar si el email ya existe
    const userExists = await this.usersService.findByEmail(email);
    if (userExists) {
      throw new ConflictException('El correo ya está registrado');
    }

    // 2. Hashear la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(contrasenia, saltRounds);

    // 3. Crear el usuario
    const newUser = this.usersService.create({
      email,
      nombre,
      contrasenia: hashedPassword,
      fechaRegistro: new Date(),
    });

    // 4. Eliminar la contraseña antes de retornar
    const { contrasenia: _, ...userWithoutPassword } = newUser;

    // 5. Retornar usuario sin contraseña
    return userWithoutPassword;
  }

  /**
   * LOGIN DE USUARIO
   * 1. Busca usuario por email
   * 2. Verifica contraseña
   * 3. Genera token JWT
   * 4. Retornar usuario sin contraseña + token
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 1. Buscar usuario por email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 2. Verificar contraseña
    const passwordValid = await bcrypt.compare(password, user.contrasenia);
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 3. Generar token JWT
    const payload = {
      sub: user.id,
      email: user.email,
    };
    const access_token = await this.jwtService.sign(payload);

    // 4. Retornar usuario sin contraseña + token
    const { contrasenia, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      access_token,
    };
  }

  /**
   * OBTENER PERFIL
   * Retorna información del usuario autenticado
   * 1. Buscar usuario por ID
   * 2. Retornar usuario sin contraseña
   */
  async getProfile(userId: number) {
    // 1. Buscar usuario por ID
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // 2. Retornar usuario sin contraseña
    const { contrasenia, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }
}
