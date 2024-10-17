import { Router } from 'express' // Importa o Router do Express
import { authenticateUser, createUser, deleteUser, findAllUsers, findUserByIdWithTasks, updateUser } from '../controllers/user.controller' // Importa os métodos do controlador
import { validate } from '../middlewares/validate.middleware'
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dto'

const router = Router() // Cria uma instância do Router

router.post('/', validate(CreateUserDto), createUser) // Define a rota para criar um usuário
router.get('/', findAllUsers) // Define a rota para buscar todos os usuários
router.patch('/:id', validate(UpdateUserDto), updateUser) // Define a rota para atualizar um usuário
router.delete('/:id', deleteUser) // Define a rota para deletar um usuário
router.get('/:id/tasks', findUserByIdWithTasks) // Define a rota para buscar um usuário pelo ID e suas tarefas
router.post('/authenticate', authenticateUser) // Define a rota para autenticar um usuário

export default router // Exporta o router