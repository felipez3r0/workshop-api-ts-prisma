import { Request, Response } from 'express' // Importa os tipos do Express
import { createUserService, findAllUsersService } from '../services/user.service' // Importa os métodos do serviço

export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await createUserService(req.body) // Cria um novo usuário
    return res.status(201).json(user) // Retorna o usuário criado
  } catch (error) {
    return res.status(400).json({ message: error }) // Retorna um erro
  }
}

export const findAllUsers = async (req: Request, res: Response) => {
  const users = await findAllUsersService() // Busca todos os usuários
  return res.status(200).json(users) // Retorna os usuários
}