import { Router } from "express";
import authRoutes from "../modules/auth/routes/auth.routes.js";
import auctionRoutes from "../modules/auction/routes/auction.routes.js";
import paymentRoutes from "../modules/payment/routes/payment.routes.js";

const router = Router();

router.get("/health", (req, res) => {
    res.send("OK");
});

router.use("/auth", authRoutes);
router.use("/auctions", auctionRoutes);
router.use("/payments", paymentRoutes);

export default router;