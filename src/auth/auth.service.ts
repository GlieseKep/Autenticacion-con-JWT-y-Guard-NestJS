import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
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

    // 1. Verificar si el email ya existe
    const userExists = this.usersService.findByEmail(registerDto.email);
    if (userExists) {
      throw new ConflictException('El correo ya está registrado');
    }

    // 2. Hashear la contraseña
    const hashedPassword = await bcrypt.hash(registerDto.contrasenia, 10);

    // 3. Crear el usuario
    const newUser = this.usersService.create({
      ...registerDto,
      contrasenia: hashedPassword,
    });

    // 4. Retornar usuario sin contraseña
    const { contrasenia, ...result } = newUser;
    return {
      message: 'Usuario registrado exitosamente',
      user: result,
    };
  }

  /**
   * LOGIN DE USUARIO
   * 1. Busca usuario por email
   * 2. Verifica contraseña
   * 3. Genera token JWT
   * 4. Retornar usuario sin contraseña + token
   */
  async login(loginDto: LoginDto) {

    // 1. Buscar usuario por email
    const user = this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 2. Verificar contraseña
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.contrasenia,
      user.contrasenia,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 3. Generar token JWT
    const payload = { sub: user.id, email: user.email, nombre: user.nombre };

    // 4. Retornar usuario sin contraseña + token
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
      },
    };
  }

  /**
   * OBTENER PERFIL
   * Retorna información del usuario autenticado
   * 1. Buscar usuario por ID
   * 2. Retornar usuario sin contraseña
   */
  getProfile(userId: number) {
    // 1. Buscar usuario por ID
    const user = this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // 2. Retornar usuario sin contraseña
    const { contrasenia, ...result } = user;
    return result;
  }
}
