import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator' // Importa os decoradores de validação

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title!: string

  @IsOptional()
  @IsBoolean()
  completed?: boolean
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string

  @IsOptional()
  @IsBoolean()
  completed?: boolean
}