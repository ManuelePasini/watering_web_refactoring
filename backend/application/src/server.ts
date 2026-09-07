import { app } from './app.js'

const port = Number(process.env.BACKEND_PORT) || 8081

app.listen(port, () => {
  console.log(`Server is running at ${process.env.BACKEND_ADDRESS}`)
})
