import User from '../entities/user.entity' // Importa o modelo de usuário

export const createUser = async (data: { name: string, email: string, password: string }) => {
  return User.create({ data }) // Cria um novo usuário
}

export const findAllUsers = async () => {
  return User.findMany() // Busca todos os usuários
}

export const findUserByEmail = async (email: string) => {
  return User.findFirst({ where: { email } }) // Busca um usuário pelo e-mail
}

export const updateUser = async (id: number, data: { name: string, email: string, password: string }) => {
  return User.update({ where: { id }, data }) // Atualiza um usuário
}

export const deleteUser = async (id: number) => {
  return User.delete({ where: { id } }) // Deleta um usuário
}

export const findUserById = async (id: number) => {
  return User.findFirst({ where: { id } }) // Busca um usuário pelo id
}