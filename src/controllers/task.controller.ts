import { Request, Response } from 'express'
import { createTaskService, findAllTasksService, findTaskByIdService, updateTaskService, deleteTaskService } from '../services/task.service'
import * as jose from 'jose'

// Adiciona a propriedade user ao objeto de requisição do Express - para que o TypeScript reconheça a propriedade
declare module 'express-serve-static-core' {
  interface Request {
    user?: jose.JWTPayload
  }
}

export const createTask = async (req: Request, res: Response) => {
  try {
    if(!req.user) {
      return res.status(401).json({ message: 'Token não informado' })
    }
    
    const task = await createTaskService({ ...req.body, userId: req.user.id }) // Adiciona o id do usuário que criou a tarefa, esse user é o que foi definido no middleware de autenticação
    return res.status(201).json(task)
  } catch (error) {
    return res.status(400).json({ message: error })
  }
}

export const findAllTasks = async (req: Request, res: Response) => {
  const tasks = await findAllTasksService()
  return res.status(200).json(tasks)
}

export const findTaskById = async (req: Request, res: Response) => {
  const task = await findTaskByIdService(Number(req.params.id))
  return res.status(200).json(task)
}

export const updateTask = async (req: Request, res: Response) => {
  try {
    const task = await updateTaskService(Number(req.params.id), req.body)
    return res.status(200).json(task)
  } catch (error) {
    return res.status(400).json({ message: error })
  }
}

export const deleteTask = async (req: Request, res: Response) => {
  try {
    await deleteTaskService(Number(req.params.id))
    return res.status(204).send()
  } catch (error) {
    return res.status(400).json({ message: error })
  }
}