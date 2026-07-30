import appRoutes from "../routes/index.js";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import ErrorHandler from "../shared/utils/errorHandler.js";
import notFound from "../shared/utils/not-found.js";

const app = express()
app.use(express.json({ limit: "5mb" }))
app.use(express.urlencoded({ extended: true, limit: "5mb" }))
app.use(cookieParser())
app.use(cors({
    origin: "https://bidnaam.vercel.app",
    credentials: true,
}))

app.use("/api/v1", appRoutes);


app.use(notFound)
app.use(ErrorHandler)
export default app;
