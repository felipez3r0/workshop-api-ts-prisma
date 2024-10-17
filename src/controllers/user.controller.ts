import { Request, Response } from 'express' // Importa os tipos do Express
import { authenticateUserService, createUserService, deleteUserService, findAllUsersService, findUserByIdWithTasksService, updateUserService } from '../services/user.service' // Importa os métodos do serviço

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

export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await updateUserService(Number(req.params.id), req.body) // Atualiza um usuário
    return res.status(200).json(user) // Retorna o usuário atualizado
  } catch (error) {
    return res.status(400).json({ message: error }) // Retorna um erro
  }
}

export const deleteUser = async (req: Request, res: Response) => {
  try {
    await deleteUserService(Number(req.params.id)) // Deleta um usuário
    return res.status(204).send() // Retorna uma resposta vazia
  } catch (error) {
    return res.status(400).json({ message: error }) // Retorna um erro
  }
}

export const findUserByIdWithTasks = async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  
  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID inválido' })
  }

  const user = await findUserByIdWithTasksService(id)
  return res.status(200).json(user)
}

export const authenticateUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'E-mail e senha são obrigatórios' })
    }
    const token = await authenticateUserService(email, password)
    return res.status(200).json({ token })
  } catch (error) {
    return res.status(400).json({ message: error })
  }
}