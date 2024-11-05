import express from 'express' // Importa o Express
import routes from './routes' // Importa as rotas
import cors from 'cors' // Importa o CORS
import swaggerUi from 'swagger-ui-express'
import swaggerFile from './swagger.json' // Carregar o arquivo JSON

const app = express() // Cria uma instância do Express
const PORT = process.env.PORT || 3000 // Define a porta do servidor

app.use(cors()) // Habilita o CORS
app.use(express.json()) // Habilita o uso de JSON nas requisições

app.use('/api', routes) // Define o prefixo para as rotas

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile)) // Configura o Swagger UI

app.listen(PORT, () => {
  console.log(`Server rodando em http://localhost:${PORT}`) // Inicia o servidor
})