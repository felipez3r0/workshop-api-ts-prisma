import { plainToInstance } from 'class-transformer' // Importa a função plainToInstance
import { Request, Response, NextFunction } from 'express' // Importa os tipos do Express
import { validate as classValidatorValidate } from 'class-validator' // Importa a função validate do class-validator

export const validate = (dto: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const data = plainToInstance(dto, req.body) // Converte os dados para a classe
    const errors = await classValidatorValidate(data) // Valida os dados

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Dados inválidos', errors }) // Retorna um erro
    }

    req.body = data // Define os dados validados
    next() // Chama o próximo middleware
  }
}