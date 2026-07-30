import { connectDB } from "./src/config/db.js";
import { env } from "./src/config/env.js";
import app from "./src/app/app.js";

async function startServer() {
    await connectDB();
    app.listen(env.PORT, () => {
        console.log(`server is running on port ${env.PORT}`);
    });
}


startServer()