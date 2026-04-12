import express, { Request, Response } from "express"
import authRoutes from "./routes/auth.routes"
import userRoutes from "./routes/user.routes"


const app = express()

app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)


app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({"message": "Server running"})
})

export default app