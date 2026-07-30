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
import { uploadMiddleware } from "../../../shared/utils/imagekit.util.js";

const router = Router();

// Public routes (Browse & Details)
router.get("/", getAllAuctionsController);
router.get("/:id", auctionIdParamValidator, getAuctionByIdController);

// Authenticated routes (Create, Update, Delete with optional file upload)
router.post(
  "/",
  authenticate,
  uploadMiddleware.array("images", 5),
  createAuctionValidator,
  createAuctionController
);
router.put(
  "/:id",
  authenticate,
  uploadMiddleware.array("images", 5),
  auctionIdParamValidator,
  updateAuctionController
);
router.delete(
  "/:id",
  authenticate,
  auctionIdParamValidator,
  deleteAuctionController
);

export default router;
