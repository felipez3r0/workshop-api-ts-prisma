import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator' // Importa os decoradores de validação

export class RequestCreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title!: string

  @IsOptional()
  @IsBoolean()
  completed?: boolean
}

export interface CreateTaskDto {
  title: string
  completed?: boolean
  userId: number
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