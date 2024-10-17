import { CreateUserDto, UpdateUserDto } from '../dtos/user.dto'
import { createUser, deleteUser, findAllUsers, findUserByEmail, findUserById, findUserByIdWithTasks, updateUser } from '../repositories/user.repository' // Importa os métodos do repositório
import bcrypt from 'bcrypt' // Importa o bcrypt
import * as jose from 'jose'

export const createUserService = async (data: CreateUserDto) => {
  const user = await findUserByEmail(data.email) // Busca um usuário pelo e-mail

  if (user) {
    throw new Error('Usuário já existe') // Se o usuário já existir, lança um erro
  }

  const password = await bcrypt.hash(data.password, 10) // Criptografa a senha e escolhe o número de rounds, quanto maior o número, mais seguro é o hash (mas também mais lento)

  return createUser({ ...data, password }) // Aqui devemos passar a senha criptografada, estamos usando os 3 pontos para copiar todas as propriedades de data e adicionar a senha criptografada (é uma forma de fazer um merge de objetos, isso leva o nome de spread operator)
}

export const findAllUsersService = async () => {
  return findAllUsers() // Busca todos os usuários
}

export const updateUserService = async (id: number, data: UpdateUserDto) => {
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

export const findUserByIdWithTasksService = async (id: number) => {
  return findUserByIdWithTasks(id)
}

export const authenticateUserService = async (email: string, password: string) => {
  const user = await findUserByEmail(email) // Busca um usuário pelo e-mail

  if (!user) {
    throw new Error('Usuário não encontrado') // Se o usuário não existir, lança um erro
  }

  const isValid = await bcrypt.compare(password, user.password) // Compara a senha criptografada com a senha informada

  if (!isValid) {
    throw new Error('Senha inválida') // Se a senha for inválida, lança um erro
  }

  const payload = { id: user.id, email: user.email } // Cria um payload com o id e o e-mail do usuário
  const secret = new TextEncoder().encode(process.env.JWT_SECRET) // Pega a chave secreta do JWT do arquivo .env - essa chave é usada para assinar o token e não deve ser exposta
  const alg = 'HS256' // Define o algoritmo de criptografia

  const token = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt() // Define a data de emissão do token
    .setIssuer('http://localhost:3000') // Define o emissor do token
    .setSubject('users') // Define o assunto do token
    .setExpirationTime('1h') // Define o tempo de expiração do token
    .sign(secret) // Assina o token com a chave secreta


  return token // Retorna o token
}