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