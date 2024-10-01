import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator' // Importa os decoradores de validação

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string

  @IsEmail()
  email!: string

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password?: string
}