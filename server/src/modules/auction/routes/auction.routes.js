import { Router } from "express";
import {
  createAuctionController,
  getAllAuctionsController,
  getAuctionByIdController,
  updateAuctionController,
  deleteAuctionController,
} from "../controllers/auction.controller.js";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import {
  createAuctionValidator,
  auctionIdParamValidator,
} from "../validators/auction.validator.js";

const router = Router();

// Public routes (Browse & Details)
router.get("/", getAllAuctionsController);
router.get("/:id", auctionIdParamValidator, getAuctionByIdController);

// Authenticated routes (Create, Update, Delete)
router.post("/", authenticate, createAuctionValidator, createAuctionController);
router.put("/:id", authenticate, auctionIdParamValidator, updateAuctionController);
router.delete("/:id", authenticate, auctionIdParamValidator, deleteAuctionController);

export default router;
