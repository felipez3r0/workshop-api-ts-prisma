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