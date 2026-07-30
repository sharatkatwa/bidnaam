import ImageKit from "imagekit";
import { env } from "./env.js";

/**
 * ImageKit SDK Instance Initialization
 * Uses environment variables for authentication.
 */
export const imagekit = new ImageKit({
  publicKey: env.IMAGEKIT_PUBLIC_KEY,
  privateKey: env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
});
