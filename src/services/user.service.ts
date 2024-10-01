import { createUser, deleteUser, findAllUsers, findUserByEmail, findUserById, updateUser } from '../repositories/user.repository' // Importa os métodos do repositório

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

export const updateUserService = async (id: number, data: { name: string, email: string, password: string }) => {
  const user = await findUserById(id) // Busca um usuário pelo id

  if (!user) {
    throw new Error('Usuário não encontrado') // Se o usuário não existir, lança um erro
  }

  return updateUser(id, data) // Atualiza um usuário
}

export const deleteUserService = async (id: number) => {
  const user = await findUserById(id) // Busca um usuário pelo id

  if (!user) {
    throw new Error('Usuário não encontrado') // Se o usuário não existir, lança um erro
  }

  return deleteUser(id) // Deleta um usuário
}