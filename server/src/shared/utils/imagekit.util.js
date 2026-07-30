import path from "path";
import multer from "multer";
import { imagekit } from "../../config/imagekit.config.js";
import { ValidationError } from "../errors/custom-error.js";

// Multer in-memory storage config
const storage = multer.memoryStorage();

/**
 * Multer middleware for handling image file uploads in memory
 */
export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB maximum per file
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new ValidationError("Only image files are allowed."), false);
    }
  },
});

/**
 * Upload a single file buffer to ImageKit with a unique collision-free filename
 * @param {Buffer} fileBuffer - Image file buffer
 * @param {string} fileName - Original file name string
 * @param {string} folder - Target ImageKit folder (default: "/auctions")
 * @returns {Promise<Object>} Upload result containing { url, fileId, name }
 */
export async function uploadToImageKit(fileBuffer, fileName, folder = "/auctions") {
  const ext = fileName ? path.extname(fileName) : ".jpg";
  const baseName = fileName
    ? path.basename(fileName, ext).replace(/[^a-zA-Z0-9]/g, "_")
    : "img";
  const uniqueFileName = `auction_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 7)}_${baseName}${ext}`;

  return new Promise((resolve, reject) => {
    imagekit.upload(
      {
        file: fileBuffer,
        fileName: uniqueFileName,
        folder,
        useUniqueFileName: true,
      },
      (error, result) => {
        if (error) {
          return reject(
            new ValidationError(`ImageKit Upload Failed: ${error.message}`)
          );
        }
        resolve({
          url: result.url,
          fileId: result.fileId,
          name: result.name,
        });
      }
    );
  });
}

/**
 * Upload multiple file buffers to ImageKit
 * @param {Array<Object>} files - Array of Express Multer file objects
 * @param {string} folder - Target ImageKit folder
 * @returns {Promise<Array<string>>} Array of uploaded ImageKit URLs
 */
export async function uploadMultipleToImageKit(files, folder = "/auctions") {
  if (!files || files.length === 0) return [];

  const uploadPromises = files.map((file) =>
    uploadToImageKit(file.buffer, file.originalname, folder)
  );

  const results = await Promise.all(uploadPromises);
  return results.map((res) => res.url);
}
