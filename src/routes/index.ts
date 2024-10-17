import { Router } from 'express' // Importa o Router do Express
import userRoutes from './user.routes' // Importa as rotas de usuário
import taskRoutes from './task.routes'

const router = Router() // Cria uma instância do Router

router.use('/users', userRoutes) // Define o prefixo para as rotas de usuário
router.use('/tasks', taskRoutes) // Define o prefixo para as rotas de tarefa

export default router // Exporta o router