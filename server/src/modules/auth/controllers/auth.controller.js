import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../../../shared/utils/async-handler.js";
import { successResponse } from "../../../shared/utils/successResponse.js";
import {
    ValidationError,
    UnauthorizedError,
    ConflictError,
    NotFoundError,
} from "../../../shared/errors/custom-error.js";
import {
    createUser,
    findUserByEmail,
    findUserById,
} from "../dao/user.dao.js";
import {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
} from "../../../shared/utils/jwt.util.js";
import { isProduction } from "../../../config/env.js";

// Cookie options for secure token delivery
const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
};

/**
 * Register a new user
 */
export const register = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ValidationError("Email and password are required");
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        throw new ConflictError("User with this email already exists");
    }

    const user = await createUser({ email, password });

    const accessToken = signAccessToken({ id: user._id, email: user.email });
    const refreshToken = signRefreshToken({ id: user._id });

    res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return successResponse(res, "User registered successfully", StatusCodes.CREATED, {
        user: {
            _id: user._id,
            email: user.email,
            isActive: user.isActive,
        },
        accessToken,
        refreshToken,
    });
});

/**
 * Login user
 */
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ValidationError("Email and password are required");
    }

    const user = await findUserByEmail(email, true);
    if (!user) {
        throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.isActive) {
        throw new UnauthorizedError("User account is deactivated");
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        throw new UnauthorizedError("Invalid email or password");
    }

    const accessToken = signAccessToken({ id: user._id, email: user.email });
    const refreshToken = signRefreshToken({ id: user._id });

    res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return successResponse(res, "Login successful", StatusCodes.OK, {
        user: {
            _id: user._id,
            email: user.email,
            isActive: user.isActive,
        },
        accessToken,
        refreshToken,
    });
});

/**
 * Logout user by clearing auth cookies
 */
export const logout = asyncHandler(async (req, res) => {
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    return successResponse(res, "Logged out successfully", StatusCodes.OK, null);
});

/**
 * Refresh access token using refresh token
 */
export const refresh = asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
        throw new UnauthorizedError("Refresh token is required");
    }

    let decoded;
    try {
        decoded = verifyRefreshToken(token);
    } catch (error) {
        throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const user = await findUserById(decoded.id);
    if (!user || !user.isActive) {
        throw new UnauthorizedError("User not found or inactive");
    }

    const accessToken = signAccessToken({ id: user._id, email: user.email });

    res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000,
    });

    return successResponse(res, "Token refreshed successfully", StatusCodes.OK, {
        accessToken,
    });
});

/**
 * Get current authenticated user profile
 */
export const me = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
        throw new UnauthorizedError("User authentication required");
    }

    const user = await findUserById(userId);
    if (!user) {
        throw new NotFoundError("User not found");
    }

    return successResponse(res, "User profile retrieved successfully", StatusCodes.OK, {
        user: {
            _id: user._id,
            email: user.email,
            isActive: user.isActive,
            createdAt: user.createdAt,
        },
    });
});
