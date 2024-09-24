import express from 'express' // Importa o Express
import routes from './routes' // Importa as rotas

const app = express() // Cria uma instância do Express
const PORT = 3000 // Define a porta do servidor
app.use(express.json()) // Habilita o uso de JSON nas requisições

app.use('/api', routes) // Define o prefixo para as rotas

app.listen(PORT, () => {
  console.log(`Server rodando em http://localhost:${PORT}`) // Inicia o servidor
})