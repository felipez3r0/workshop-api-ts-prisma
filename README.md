# Workshop - TS / Express e Prisma

## Objetivo

O objetivo deste workshop é criar uma aplicação simples de gerenciamento de usuários e tarefas utilizando TypeScript, Express e Prisma.

## Requisitos

- Node.js (20 ou superior)

## Etapas

### Etapa 1 - Inicialização do projeto

Vamos começar criando um novo projeto Node.js utilizando o TypeScript.

```bash
npm init -y
npm install -D typescript ts-node @types/node
npx tsc --init
```

Vamos adicionar as dependências do Express e de seus tipos.

```bash
npm install express
npm install -D @types/express
```

Precisamos agora configurar as dependências do Prisma, o Prisma é um ORM (Object Relational Mapping) que nos permite interagir com o banco de dados de forma mais simples. Depois da instalação, vamos inicializar o projeto com o comando `init`.

```bash
npm install -D prisma
npx prisma init
```

### Etapa 2 - Configuração do Prisma

Vamos configurar o Prisma para utilizar o SQLite como banco de dados. Abra o arquivo `.env` e adicione o seguinte conteúdo:

```bash
DATABASE_URL="file:./database.sqlite"
```

No arquivo `schema.prisma`, vamos adicionar o seguinte conteúdo:

```prisma
datasource db {
  provider = "sqlite" // Ajuste feito para utilizar o SQLite
  url      = env("DATABASE_URL")
}
```

Essa configuração define o banco de dados que será utilizado e o arquivo onde ele será armazenado. É muito importante adicionar o .env no .gitignore para não subir os detalhes do banco de dados para o repositório.

Para criar o banco de dados, execute o comando:

```bash
npx prisma db push
```

Por enquanto não temos nenhuma tabela no banco de dados, então vamos criar um modelo de usuário. Adicione o seguinte conteúdo no arquivo `schema.prisma`:

```prisma
model User {
  id    Int     @id @default(autoincrement())
  name  String
  email String  @unique
  password String
}
```

Com isso vamos criar uma entidade de usuário com os campos `name`, `email` e `password`. Para aplicar as mudanças no banco de dados, execute o comando:

```bash
npx prisma db push
```

### Etapa 3 - Configurando o nodemon e o ts-node e o swc

Para facilitar o desenvolvimento, vamos adicionar o nodemon para reiniciar o servidor sempre que houver uma mudança nos arquivos e o ts-node para executar o TypeScript diretamente.

```bash
npm install -D @swc/core @swc/helpers nodemon
```

Vamos adicionar um script no `package.json` para iniciar o servidor com o nodemon e o ts-node.

```json
"scripts": {
  "dev": "nodemon --exec ts-node --swc src/server.ts"
}
```

Vamos criar um arquivo `server.ts` na pasta `src` com o seguinte conteúdo:

```typescript
import express from 'express' // Importa o Express

const app = express() // Cria uma instância do Express
const PORT = 3000 // Define a porta do servidor

app.get('/', (req, res) => {
  res.send('Hello World!') // Retorna uma mensagem
})

app.listen(PORT, () => {
  console.log(`Server rodando em http://localhost:${PORT}`) // Inicia o servidor
})
```

### Etapa 4 - Criação do servidor Express e da primeira entidade

Para esse projeto vamos adotar uma arquitetura com a separação de rotas, controladores, serviços, repositórios e entidades. Vamos começar criando a estrutura de pastas do projeto. A estrutura de pastas que vamos adotar é a seguinte:

```
src/
  controllers/
  entities/
  repositories/
  routes/
  services/
```

A pasta src é o diretório `source`, nele vão ficar nossos arquivos TypeScript. Depois de compilado o projeto vai ser armaenado na pasta `dist`.

Nessa arquitetura cada uma das camadas tem uma responsabilidade diferente e vamos seguir a seguinte lógica:

- **Rotas**: Responsável por definir as rotas da aplicação e chamar os controladores.
- **Controladores**: Responsável por receber as requisições, realizar a validação dos dados e chamar os serviços.
- **Serviços**: Responsável por implementar a lógica de negócio da aplicação e chamar os repositórios.
- **Repositórios**: Responsável por realizar a comunicação com o banco de dados.
- **Entidades**: Responsável por definir a estrutura dos dados que serão utilizados na aplicação (nesse caso vamos utilizar os modelos do Prisma).

Vamos começar de dentro para fora, criando a entidade de usuário. Crie um arquivo `user.entity.ts` na pasta `entities` com o seguinte conteúdo:

```typescript
import { PrismaClient } from '@prisma/client' // Importa o PrismaClient

const prisma = new PrismaClient() // Cria uma instância do PrismaClient

export default prisma.user // Exporta o modelo de usuário
```

Agora vamos criar o repositório de usuário. Crie um arquivo `user.repository.ts` na pasta `repositories` com o seguinte conteúdo:

```typescript
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
```

Aqui estamos usando uma abordagem de criar as funções diretamente e não partir para classes por uma questão de simplicidade. Em projetos maiores é recomendado utilizar classes para organizar melhor o código e trabalhar com injeção de dependências (esse pode ser um tema para um próximo workshop - refatoração do projeto).

Agora vamos criar o serviço de usuário. Crie um arquivo `user.service.ts` na pasta `services` com o seguinte conteúdo:

```typescript
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
```

Aqui estamos utilizando o repositório para buscar um usuário pelo e-mail antes de criar um novo usuário. Se o usuário já existir, lançamos um erro.

Agora vamos criar o controlador de usuário. Crie um arquivo `user.controller.ts` na pasta `controllers` com o seguinte conteúdo:

```typescript
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
```

Aqui estamos utilizando o serviço para criar um novo usuário e buscar todos os usuários. Se ocorrer um erro, retornamos um status 400 com a mensagem de erro.

Agora vamos criar as rotas de usuário. Crie um arquivo `user.routes.ts` na pasta `routes` com o seguinte conteúdo:

```typescript
import { Router } from 'express' // Importa o Router do Express
import { createUser, findAllUsers } from '../controllers/user.controller' // Importa os métodos do controlador

const router = Router() // Cria uma instância do Router

router.post('/', createUser) // Define a rota para criar um usuário
router.get('/', findAllUsers) // Define a rota para buscar todos os usuários

export default router // Exporta o router
```

Para centralizar nossas rotas, vamos criar um arquivo `index.ts` na pasta `routes` com o seguinte conteúdo:

```typescript
import { Router } from 'express' // Importa o Router do Express
import userRoutes from './user.routes' // Importa as rotas de usuário

const router = Router() // Cria uma instância do Router

router.use('/users', userRoutes) // Define o prefixo para as rotas de usuário

export default router // Exporta o router
```

Agora vamos criar o servidor Express. Crie um arquivo `server.ts` na pasta `src` com o seguinte conteúdo:

```typescript
import express from 'express' // Importa o Express
import routes from './routes' // Importa as rotas

const app = express() // Cria uma instância do Express
const PORT = 3000 // Define a porta do servidor
app.use(express.json()) // Habilita o uso de JSON nas requisições

app.use('/api', routes) // Define o prefixo para as rotas

app.listen(PORT, () => {
  console.log(`Server rodando em http://localhost:${PORT}`) // Inicia o servidor
})
```

Para testar o servidor, execute o comando:

```bash
npm run dev
```

### Etapa 5 - Adicionando o update e o delete

Vamos adicionar as funcionalidades de atualizar e deletar um usuário. Vamos começar criando as funções no repositório. Adicione as seguintes funções no arquivo `user.repository.ts`:

```typescript
export const updateUser = async (id: number, data: { name: string, email: string, password: string }) => {
  return User.update({ where: { id }, data }) // Atualiza um usuário
}

export const deleteUser = async (id: number) => {
  return User.delete({ where: { id } }) // Deleta um usuário
}

export const findUserById = async (id: number) => {
  return User.findFirst({ where: { id } }) // Busca um usuário pelo id
}
```

Agora vamos adicionar as funções no serviço. Adicione as seguintes funções no arquivo `user.service.ts`:

```typescript
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
```

Agora vamos adicionar as funções no controlador. Adicione as seguintes funções no arquivo `user.controller.ts`:

```typescript
import { updateUser, deleteUser } from '../services/user.service' // Importa os métodos do serviço

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
```

Agora vamos adicionar as rotas de atualizar e deletar um usuário. Adicione as seguintes rotas no arquivo `user.routes.ts`:

```typescript
router.patch('/:id', updateUser) // Define a rota para atualizar um usuário
router.delete('/:id', deleteUser) // Define a rota para deletar um usuário
```

### Etapa 6 - Validando os dados com class-validator

Vamos adicionar a validação dos dados utilizando a biblioteca class-validator. Vamos começar instalando a biblioteca.

```bash
npm install class-validator class-transformer
```

Para usar os decoradores de validação, precisamos habilitar a opção `experimentalDecorators` e a opção `emitDecoratorMetadata` no arquivo `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

Agora vamos criar um arquivo `user.dto.ts` na pasta `dtos` com o seguinte conteúdo:

```typescript
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator' // Importa os decoradores de validação

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string

  @IsEmail()
  email!: string

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password?: string
}
```

Vamos construir um middleware para validar os dados. O Middleware é uma função que recebe a requisição, a resposta e o próximo middleware e pode realizar alguma ação antes de seguir. Crie um arquivo `validate.middleware.ts` na pasta `middlewares` com o seguinte conteúdo:

```typescript
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
```

Agora vamos adicionar a validação nas rotas. Adicione a validação nas rotas de criar e atualizar um usuário no arquivo `user.routes.ts`:

```typescript
import { validate } from '../middlewares/validate.middleware' // Importa o middleware de validação
import { CreateUserDto } from '../dtos/user.dto' // Importa o DTO de usuário

router.post('/', validate(CreateUserDto), createUser) // Define a rota para criar um usuário
router.patch('/:id', validate(CreateUserDto), updateUser) // Define a rota para atualizar um usuário
```

Dessa forma estamos validando os dados antes de chamar o controlador. Se os dados não estiverem de acordo com o DTO, retornamos um erro.

### Etapa 7 - Adicionando as tarefas

Vamos adicionar a entidade de tarefa. Primeiro vamos ajustar o schema do Prisma. Adicione o seguinte conteúdo no arquivo `schema.prisma`:

```prisma
model Task {
  id        Int     @id @default(autoincrement())
  title     String
  completed Boolean @default(false)
  userId    Int
  user      User    @relation(fields: [userId], references: [id]) // Define a relação com o usuário, o campo userId é a chave estrangeira para o id do usuário
}
```

Precisamos ajustar o model User para adicionar a relação com a tarefa. Vamos ajustar no schema do Prisma. Adicione o seguinte conteúdo no arquivo `schema.prisma`:

```prisma
model User {
  id    Int     @id @default(autoincrement())
  name  String
  email String  @unique
  password String
  tasks Task[] // Define a relação com as tarefas, um usuário pode ter várias tarefas
}
```

Depois dos ajustes no schema, execute o comando:

```bash
npx prisma db push
```

Agora vamos criar um arquivo `task.entity.ts` na pasta `entities` com o seguinte conteúdo:

```typescript
import { PrismaClient } from '@prisma/client' // Importa o PrismaClient

const prisma = new PrismaClient() // Cria uma instância do PrismaClient

export default prisma.task // Exporta o modelo de tarefa
```

Agora vamos começar criando os DTOs para a tarefa. Crie um arquivo `task.dto.ts` na pasta `dtos` com o seguinte conteúdo:

```typescript
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title!: string

  @IsOptional()
  @IsBoolean()
  completed?: boolean

  @IsInt()
  @IsNotEmpty()
  userId!: number
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string

  @IsOptional()
  @IsBoolean()
  completed?: boolean
}
```

Agora vamos criar o repositório de tarefa. Crie um arquivo `task.repository.ts` na pasta `repositories` com o seguinte conteúdo:

```typescript
import { CreateTaskDto, UpdateTaskDto } from '../dtos/task.dto'
import Task from '../entities/task.entity'

export const createTask = async (data: CreateTaskDto) => {
  return Task.create({ data })
}

export const findAllTasks = async () => {
  return Task.findMany()
}

export const findTaskById = async (id: number) => {
  return Task.findFirst({ where: { id } })
}

export const updateTask = async (id: number, data: UpdateTaskDto) => {
  return Task.update({ where: { id }, data })
}

export const deleteTask = async (id: number) => {
  return Task.delete({ where: { id } })
}
```

Agora vamos criar o serviço de tarefa. Crie um arquivo `task.service.ts` na pasta `services` com o seguinte conteúdo:

```typescript
import { CreateTaskDto, UpdateTaskDto } from '../dtos/task.dto'
import { createTask, findAllTasks, findTaskById, updateTask, deleteTask } from '../repositories/task.repository'

export const createTaskService = async (data: CreateTaskDto) => {
  return createTask(data)
}

export const findAllTasksService = async () => {
  return findAllTasks()
}

export const findTaskByIdService = async (id: number) => {
  return findTaskById(id)
}

export const updateTaskService = async (id: number, data: UpdateTaskDto) => {
  return updateTask(id, data)
}

export const deleteTaskService = async (id: number) => {
  return deleteTask(id)
}
```

Agora vamos criar o controlador de tarefa. Crie um arquivo `task.controller.ts` na pasta `controllers` com o seguinte conteúdo:

```typescript
import { Request, Response } from 'express'
import { createTaskService, findAllTasksService, findTaskByIdService, updateTaskService, deleteTaskService } from '../services/task.service'

export const createTask = async (req: Request, res: Response) => {
  try {
    const task = await createTaskService(req.body)
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
```

Agora vamos criar as rotas de tarefa. Crie um arquivo `task.routes.ts` na pasta `routes` com o seguinte conteúdo:

```typescript
import { Router } from 'express' // Importa o Router do Express
import { createTask, updateTask, deleteTask, findAllTasks } from '../controllers/task.controller' // Importa os métodos do controlador
import { validate } from '../middlewares/validate.middleware'
import { CreateTaskDto, UpdateTaskDto } from '../dtos/task.dto'

const router = Router() // Cria uma instância do Router

router.post('/', validate(CreateTaskDto), createTask) // Define a rota para criar uma tarefa
router.get('/', findAllTasks) // Define a rota para buscar todas as tarefas
router.patch('/:id', validate(UpdateTaskDto), updateTask) // Define a rota para atualizar uma tarefa
router.delete('/:id', deleteTask) // Define a rota para deletar uma tarefa

export default router // Exporta o router
```

Agora vamos adicionar as rotas de tarefa no arquivo `index.ts` da pasta `routes`:

```typescript
import { Router } from 'express' // Importa o Router do Express
import userRoutes from './user.routes' // Importa as rotas de usuário
import taskRoutes from './task.routes'

const router = Router() // Cria uma instância do Router

router.use('/users', userRoutes) // Define o prefixo para as rotas de usuário
router.use('/tasks', taskRoutes) // Define o prefixo para as rotas de tarefa

export default router // Exporta o router
```

### Etapa 8 - Criando uma rota para listar usuário pelo ID e suas tarefas

Vamos criar uma rota para buscar um usuário pelo ID e suas tarefas. Vamos começar criando a função no repositório. Adicione a seguinte função no arquivo `user.repository.ts`:

```typescript
export const findUserByIdWithTasks = async (id: number) => {
  return User.findFirst({ where: { id }, include: { tasks: true } }) // O include: { tasks: true } faz com que as tarefas sejam incluídas na busca
}
```

Agora vamos criar a função no serviço. Adicione a seguinte função no arquivo `user.service.ts`:

```typescript
export const findUserByIdWithTasksService = async (id: number) => {
  return findUserByIdWithTasks(id)
}
```

Agora vamos criar a função no controlador. Adicione a seguinte função no arquivo `user.controller.ts`:

```typescript
export const findUserByIdWithTasks = async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  
  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID inválido' })
  }

  const user = await findUserByIdWithTasksService(id)
  return res.status(200).json(user)
}
```

Para finalizar vamos adicionar a rota no arquivo `user.routes.ts`:

```typescript
router.get('/:id/tasks', findUserByIdWithTasks) // Define a rota para buscar um usuário pelo ID e suas tarefas
```

### Etapa 9 - Adicionando autenticação com JWT

Vamos adicionar a autenticação com JWT (JSON Web Token) para proteger as rotas de usuário e tarefa. Vamos começar instalando a biblioteca `jose`.

```bash
npm install jose
```

Vamos utilizar a bcrypt para criptografar a senha do usuário. Vamos instalar a biblioteca `bcrypt`.

```bash
npm install bcrypt
npm install -D @types/bcrypt
```

Primeiro vamos ajustar nosso serviço de cadastro de usuário para criptografar a senha. Adicione a seguinte função no arquivo `user.service.ts`:

```typescript
import bcrypt from 'bcrypt'

export const createUserService = async (data: CreateUserDto) => {
  const user = await findUserByEmail(data.email) // Busca um usuário pelo e-mail

  if (user) {
    throw new Error('Usuário já existe') // Se o usuário já existir, lança um erro
  }

  const password = await bcrypt.hash(data.password, 10) // Criptografa a senha e escolhe o número de rounds, quanto maior o número, mais seguro é o hash (mas também mais lento)

  return createUser({ ...data, password }) // Aqui devemos passar a senha criptografada, estamos usando os 3 pontos para copiar todas as propriedades de data e adicionar a senha criptografada (é uma forma de fazer um merge de objetos, isso leva o nome de spread operator)
}
```

Vamos ajustar o repositório do user para não retornar a hash da senha. Para isso vamos ajustar o arquivo `user.repository.ts`:

```typescript
export const createUser = async (data: CreateUserDto) => {
  const newUser = await User.create({ data }) // Cria um novo usuário
  return { ...newUser, password: undefined } // Remove a senha do usuário antes de retornar
}
```

A senha agora vai ser salva criptografada no banco de dados. No nosso serviço do usuário vamos adicionar a função de autenticação. Adicione a seguinte função no arquivo `user.service.ts`:

```typescript
import * as jose from 'jose'

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
```

Com o login criado vamos adicionar uma rota no nosso controlador de usuário. Adicione a seguinte função no arquivo `user.controller.ts`:

```typescript
import { authenticateUserService } from '../services/user.service'

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
```

Uma outra alternativa seria criar essas funções em um controller de autenticação, mas para simplificar vamos manter tudo no controller de usuário.

Agora vamos adicionar a rota no arquivo `user.routes.ts`:

```typescript
router.post('/authenticate', authenticateUser) // Define a rota para autenticar um usuário
```

Agora podemos criar um middleware para verificar se o token é válido. Crie um arquivo `auth.middleware.ts` na pasta `middlewares` com o seguinte conteúdo:

```typescript
import { NextFunction, Request, Response } from 'express'
import * as jose from 'jose'

// Adiciona a propriedade user ao objeto de requisição do Express - para que o TypeScript reconheça a propriedade
declare module 'express-serve-static-core' {
  interface Request {
    user?: jose.JWTPayload
  }
}


export const auth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1] // Pega o token do cabeçalho de autorização

  if (!token) {
    return res.status(401).json({ message: 'Token não informado' }) // Se o token não for informado, retorna um erro
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET) // Pega a chave secreta do JWT do arquivo .env
    const payload = await jose.jwtVerify(token, secret) // Verifica o token

    if (!payload) {
      return res.status(401).json({ message: 'Token inválido' }) // Se o token for inválido, retorna um erro
    }

    req.user = payload.payload // Adiciona o payload do token ao objeto de requisição
    next() // Chama o próximo middleware
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' }) // Se o token for inválido, retorna um erro
  }
}
```

Vamos proteger a rota de cadastrar tarefas. Adicione o middleware no arquivo `task.routes.ts`:

```typescript
router.post('/', auth, validate(CreateTaskDto), createTask) // Define a rota para criar uma tarefa
```

No controller de tarefa vamos adicionar o usuário que criou a tarefa. Adicione a seguinte função no arquivo `task.controller.ts`:

```typescript
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
```

Vamos alterar o DTO de tarefa pois agora o userId será passado pelo middleware de autenticação. Ajuste o arquivo `task.dto.ts`:

```typescript
export class RequestCreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title!: string

  @IsOptional()
  @IsBoolean()
  completed?: boolean
}

export interface CreateTaskDto {
  title: string
  completed?: boolean
  userId: number
}
```

No task.routes vamos alterar a validação para o novo DTO. Ajuste o arquivo `task.routes.ts`:

```typescript
router.post('/', auth, validate(RequestCreateTaskDto), createTask) // Define a rota para criar uma tarefa
```

Agora nas chamadas de criação de tarefa não precisamos mais passar o userId, pois ele será passado pelo middleware de autenticação. Porém precisamos informar o token que é gerado ao autenticar o usuário. Faça a chamada de autenticação e pegue o token gerado. Depois adicione o token no cabeçalho de autorização da requisição, você vai adicionar ao Thunderclient/Postman/Insomnia o cabeçalho (Headers) `Authorization` com o valor `Bearer <token>`.

### Etapa 10 - Documentação com Swagger

Vamos instalar o swagger-ui-express para visualizar a documentação

```bash
npm i swagger-ui-express
npm i -D @types/swagger-ui-express
```

Vamos adicionar a rota para visualizar a documentação no arquivo server.ts

```typescript
...
import swaggerUi from 'swagger-ui-express'
import swaggerFile from './swagger.json'
...
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile)) // Configura o Swagger UI

app.listen(PORT, () => {
  console.log(`Server rodando em http://localhost:${PORT}`) // Inicia o servidor
})
...
```

Para conseguirmos utilizar o import de um json no TypeScript, precisamos adicionar a seguinte configuração no arquivo `tsconfig.json`:

```json
{
  "compilerOptions": {
    "resolveJsonModule": true
  }
}
```

Vamos criar o arquivo `src/swagger.json` com o seguinte conteúdo:

```json
{
    "openapi": "3.0.0",
    "info": {
      "title": "API de Tarefas",
      "version": "1.0.0",
      "description": "API de tarefas com autenticação JWT"
    },
    "servers": [
      {
        "url": "http://localhost:3000/api"
      }
    ],
    "paths": {}
}
```

Para testar a documentação, execute o comando:

```bash
npm run dev
```

Acesse a URL `http://localhost:3000/api-docs` para visualizar a documentação.

Dentro do `swagger.json` vamos adicionar as rotas que desejamos documentar, vamos iniciar com a rota de listar todos os usuários. Adicione o seguinte conteúdo no arquivo `swagger.json`:

```json
{
    "openapi": "3.0.0",
    "info": {
      "title": "API de Tarefas",
      "version": "1.0.0",
      "description": "API de tarefas com autenticação JWT"
    },
    "servers": [
      {
        "url": "http://localhost:3000/api"
      }
    ],
    "paths": {
      "/users": {
        "get": {
          "summary": "Lista todos os usuários",
          "responses": {
            "200": {
              "description": "Sucesso",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/User"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "components": {
      "schemas": {
        "User": {
          "type": "object",
          "properties": {
            "id": {
              "type": "integer"
            },
            "name": {
              "type": "string"
            },
            "email": {
              "type": "string"
            },
            "password": {
              "type": "string"
            }
          }
        }
      }
    }
}
```

Podemos documentar também a rota de adicionar um usuário. Adicione o seguinte conteúdo no arquivo `swagger.json`:

```json
{
    "openapi": "3.0.0",
    "info": {...},
    "servers": [...],
    "paths": {
      "/users": {
        "get": {...},
        "post": {
          "summary": "Adiciona um usuário",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateUserDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Sucesso",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/User"
                  }
                }
              }
            },
            "400": {
              "description": "Erro",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "message": {
                        "type": "string"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "components": {
      "schemas": {
        "User": {...},
        "CreateUserDto": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            },
            "email": {
              "type": "string"
            },
            "password": {
              "type": "string"
            }
          }
        }
      }
    }
}
```

Existem algumas bibliotecas que podem ajudar a documentar a API, como o `swagger-jsdoc` e o `swagger-autogen`, essas libs costumam ser utilizadas para gerar a documentação automaticamente a partir dos comentários do código.

### Etapa 11 - Deploy no Render

Vamos fazer o deploy da nossa aplicação no Render. Primeiro vamos criar uma conta no Render e criar um novo Webservice. Vamos escolher a opção de deploy de um repositório do GitHub. Vamos adicionar o repositório da nossa aplicação e configurar o deploy.

Na aplicação vamos ajustar dois itens, primeiro o CORs para permitir que o frontend (e outras aplicações) acessem a nossa API. Vamos instalar o pacote `cors`.

```bash
npm i cors
npm i -D @types/cors
```

Vamos adicionar o middleware de CORs no nosso servidor. Adicione o seguinte conteúdo no arquivo `server.ts`:

```typescript
...
import cors from 'cors'
...
app.use(cors()) // Habilita o CORs antes de definir as rotas
```

Habilitar o CORs dessa forma permite que qualquer origem acesse a nossa API. Para restringir o acesso, podemos passar um objeto de configuração para o middleware. Existem outras opções também para configurar esses acessos como Proxy Reverso, Nginx, etc.

Para o Deploy no Render precisamos ajustar a configuração da porta do servidor. Vamos adicionar a seguinte linha no arquivo `server.ts`:

```typescript
const PORT = process.env.PORT || 3000 // Pedimos para carrergar a porta do ambiente ou usar a porta 3000
```

Esse ajuste é necessário para que o Render consiga identificar a porta que a aplicação está rodando. O Render vai passar a porta para a aplicação através da variável de ambiente `PORT`.

Vamos configurar o build da aplicação para gerar a pasta `dist` com o código transpilado. Vamos adicionar o seguinte script no arquivo `package.json`:

```json
{
  "scripts": {
    "build": "tsc"
  }
}
```

No tsconfig.json vamos ajustar o diretório de saída do código transpilado. Adicione a seguinte configuração no arquivo `tsconfig.json`:

```json
{
  "compilerOptions": {
    "outDir": "./dist"
  }
}
```

Esse diretório deve ser adicionado ao .gitignore para que não seja enviado para o repositório. Adicione a seguinte linha no arquivo `.gitignore`:

```
dist/
```

No Render ao fazer o deploy precisamos ajustar o Start Command para `node dist/server.js` e o Build Command para `npm install; npm run build`. Também precisamos adicionar uma variável de ambiente `DATABASE_URL` com a URL de conexão com o banco de dados. O JWT Secret pode ser adicionado da mesma forma.

Se precisar de uma versão específica do Node.js, podemos adicionar um arquivo `.node-version` na raiz do projeto com a versão desejada ou uma variável de ambiente `NODE_VERSION` no Render.
