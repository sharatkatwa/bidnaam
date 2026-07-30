import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../../../shared/utils/async-handler.js";
import { successResponse } from "../../../shared/utils/successResponse.js";
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
} from "../../../shared/errors/custom-error.js";
import {
  createAuction,
  getAuctionById,
  getAllAuctions,
  updateAuction,
  deleteAuction,
} from "../dao/auction.dao.js";
import Timeline from "../../../models/timeline.model.js";
import {
  uploadToImageKit,
  uploadMultipleToImageKit,
} from "../../../shared/utils/imagekit.util.js";

/**
 * Create a new auction listing with optional ImageKit image upload
 */
export const createAuctionController = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    images,
    startPrice,
    minimumIncrement,
    startTime,
    endTime,
  } = req.body;

  const sellerId = req.user._id || req.user.id;

  const start = startTime ? new Date(startTime) : new Date();
  const end = new Date(endTime);

  if (end <= start) {
    throw new ValidationError("End time must be after start time");
  }

  const now = new Date();
  const status = start <= now ? "active" : "upcoming";

  // Process image uploads via ImageKit if files are provided in request
  let imageUrls = [];
  if (req.files && req.files.length > 0) {
    imageUrls = await uploadMultipleToImageKit(req.files, "/auctions");
  } else if (req.file) {
    const uploaded = await uploadToImageKit(
      req.file.buffer,
      req.file.originalname,
      "/auctions"
    );
    imageUrls = [uploaded.url];
  } else if (images) {
    imageUrls = Array.isArray(images) ? images : [images];
  }

  const auction = await createAuction({
    seller: sellerId,
    title,
    description: description || "",
    images: imageUrls,
    startPrice: Number(startPrice),
    minimumIncrement: minimumIncrement ? Number(minimumIncrement) : 1,
    status,
    startTime: start,
    endTime: end,
    currentHighestBid: {
      amount: Number(startPrice),
      bidder: null,
      bidId: null,
      timestamp: null,
    },
  });

  // Log timeline event for auction creation
  await Timeline.create({
    auction: auction._id,
    type: "AUCTION_CREATED",
    message: `Auction "${auction.title}" was created by ${req.user.email}`,
    metadata: {
      seller: sellerId,
      startPrice: auction.startPrice,
      startTime: auction.startTime,
      endTime: auction.endTime,
    },
  });

  return successResponse(
    res,
    "Auction created successfully",
    StatusCodes.CREATED,
    { auction }
  );
});

/**
 * List all auctions with filtering, search, and pagination
 */
export const getAllAuctionsController = asyncHandler(async (req, res) => {
  const { status, seller, search, page = 1, limit = 20 } = req.query;

  const filters = {};

  if (status) {
    filters.status = status;
  }

  if (seller) {
    filters.seller = seller;
  }

  if (search) {
    filters.title = { $regex: search, $options: "i" };
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const skip = (pageNum - 1) * limitNum;

  const auctions = await getAllAuctions(filters, {
    sort: { createdAt: -1 },
    skip,
    limit: limitNum,
  });

  return successResponse(
    res,
    "Auctions retrieved successfully",
    StatusCodes.OK,
    {
      auctions,
      page: pageNum,
      limit: limitNum,
      count: auctions.length,
    }
  );
});

/**
 * Get single auction details by ID
 */
export const getAuctionByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const auction = await getAuctionById(id);
  if (!auction) {
    throw new NotFoundError("Auction not found");
  }

  return successResponse(
    res,
    "Auction retrieved successfully",
    StatusCodes.OK,
    { auction }
  );
});

/**
 * Update an existing auction listing (Seller only)
 */
export const updateAuctionController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = (req.user._id || req.user.id).toString();

  const auction = await getAuctionById(id);
  if (!auction) {
    throw new NotFoundError("Auction not found");
  }

  const sellerId = (auction.seller._id || auction.seller).toString();
  if (sellerId !== userId) {
    throw new ForbiddenError("You are not authorized to update this auction");
  }

  // Restrict updating start price or start time if bids have been placed
  if (
    auction.currentHighestBid?.bidder &&
    (req.body.startPrice || req.body.startTime)
  ) {
    throw new ValidationError(
      "Cannot update starting price or start time after bids have been placed"
    );
  }

  const updateData = { ...req.body };
  delete updateData.seller;
  delete updateData.currentHighestBid;

  // Process image updates if files provided
  if (req.files && req.files.length > 0) {
    updateData.images = await uploadMultipleToImageKit(req.files, "/auctions");
  } else if (req.file) {
    const uploaded = await uploadToImageKit(
      req.file.buffer,
      req.file.originalname,
      "/auctions"
    );
    updateData.images = [uploaded.url];
  }

  const updatedAuction = await updateAuction(id, updateData);

  return successResponse(
    res,
    "Auction updated successfully",
    StatusCodes.OK,
    { auction: updatedAuction }
  );
});

/**
 * Delete an auction listing (Seller only)
 */
export const deleteAuctionController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = (req.user._id || req.user.id).toString();

  const auction = await getAuctionById(id);
  if (!auction) {
    throw new NotFoundError("Auction not found");
  }

  const sellerId = (auction.seller._id || auction.seller).toString();
  if (sellerId !== userId) {
    throw new ForbiddenError("You are not authorized to delete this auction");
  }

  if (auction.currentHighestBid?.bidder) {
    throw new ValidationError(
      "Cannot delete an active auction that already has bids"
    );
  }

  await deleteAuction(id);

  return successResponse(
    res,
    "Auction deleted successfully",
    StatusCodes.OK,
    null
  );
});
