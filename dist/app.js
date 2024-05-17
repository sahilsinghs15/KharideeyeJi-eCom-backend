import express from "express";
import { config } from "dotenv";
config();
import userRoutes from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
const app = express();
//Middleware
app.use(express.json());
//Built in
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/v1/users", userRoutes);
app.use("*", (req, res) => {
    res.status(400).send("404 Page not found!");
});
export default app;
