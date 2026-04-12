import dotenv from "dotenv";
import app from "./server";
import { connectDB } from "./config/db";

dotenv.config();

const port = process.env.PORT || 3000;

const startServer = async () => {
    await connectDB();

    app.listen(port, () => {
        console.log(`Server listening on port: ${port}`);
    });
};

startServer();
