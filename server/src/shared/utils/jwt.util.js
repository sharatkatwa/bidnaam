import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

/**
 * Sign access token for a user
 * @param {Object} payload - Token payload (e.g. { userId, email })
 * @param {string} expiresIn - Token duration (default: '1d')
 * @returns {string} Signed JWT access token
 */
export const signAccessToken = (payload, expiresIn = "1d") => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn });
};

/**
 * Sign refresh token for a user
 * @param {Object} payload - Token payload (e.g. { userId })
 * @param {string} expiresIn - Token duration (default: '7d')
 * @returns {string} Signed JWT refresh token
 */
export const signRefreshToken = (payload, expiresIn = "7d") => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn });
};

/**
 * Verify access token
 * @param {string} token - JWT access token to verify
 * @returns {Object} Decoded token payload
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
};

/**
 * Verify refresh token
 * @param {string} token - JWT refresh token to verify
 * @returns {Object} Decoded token payload
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
};
