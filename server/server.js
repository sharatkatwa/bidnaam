import http from "http";
import { connectDB } from "./src/config/db.js";
import { env } from "./src/config/env.js";
import app from "./src/app/app.js";
import AuctionEngine from "./src/auction-engine/engine/auction.engine.js";
import AuctionScheduler from "./src/auction-engine/scheduler/auction.scheduler.js";
import { initSocketServer } from "./src/sockets/socket.server.js";

async function startServer() {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Create HTTP server from Express app
    const httpServer = http.createServer(app);

    // 3. Initialize Auction Engine
    const engine = new AuctionEngine();

    // 4. Initialize Socket.io Server & Emitter
    const { io, emitter } = initSocketServer(httpServer, engine);

    // Attach io and emitter references to Express app & engine
    app.set("io", io);
    engine.emitter = emitter;

    // 5. Re-hydrate active rooms & timers on restart (Scenario S-15)
    await engine.recoverAuction();

    // 6. Start Auction Scheduler to periodically check scheduled auctions
    const scheduler = new AuctionScheduler(engine, 30_000);
    scheduler.start();

    // 7. Start HTTP & Socket server
    httpServer.listen(env.PORT, () => {
        console.log(`[BidArena Server] Server is running on port ${env.PORT}`);
    });
}

startServer();