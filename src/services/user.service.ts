import { createUser, findAllUsers, findUserByEmail } from '../repositories/user.repository' // Importa os métodos do repositório

export const createUserService = async (data: { name: string, email: string, password: string }) => {
  const user = await findUserByEmail(data.email) // Busca um usuário pelo e-mail

  if (user) {
    throw new Error('Usuário já existe') // Se o usuário já existir, lança um erro
  }

  return createUser(data) // Cria um novo usuário
}

export const findAllUsersService = async () => {
  return findAllUsers() // Busca todos os usuários
}