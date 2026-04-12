import express, { Request, Response } from "express"
import dotenv from "dotenv"

dotenv.config()

const app = express()

const port = process.env.PORT || 3000

app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({"message": "Server running"})
})

app.listen(port, () => {
    console.log(`Server listening on port: ${port}`)
})