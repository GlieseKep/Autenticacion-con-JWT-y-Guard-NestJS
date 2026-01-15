export class User {
  //Identificador único del usuario
  id: number;
  //Nombre completo del usuario
  nombre: string;
  //Correo electrónico (se usará como username para el login)
  email: string;
  //Contraseña encriptada
  contrasenia: string;
  //Fecha en la que se registró el usuario
  fechaRegistro: Date;
}
