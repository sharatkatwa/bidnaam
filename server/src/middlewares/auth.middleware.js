import { asyncHandler } from "../shared/utils/async-handler.js";
import { UnauthorizedError, ForbiddenError } from "../shared/errors/custom-error.js";
import { verifyAccessToken } from "../shared/utils/jwt.util.js";
import { findUserById } from "../modules/auth/dao/user.dao.js";

/**
 * Authentication Middleware
 * Verifies JWT token from Authorization header or HTTP cookies,
 * ensures user exists and is active, then attaches user to req.user.
 */
export const authenticate = asyncHandler(async (req, _res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.accessToken) {
        token = req.cookies.accessToken;
    }

    if (!token) {
        throw new UnauthorizedError("Authentication token is required");
    }

    let decoded;
    try {
        decoded = verifyAccessToken(token);
    } catch (error) {
        throw new UnauthorizedError("Invalid or expired access token");
    }

    const user = await findUserById(decoded.id);
    if (!user) {
        throw new UnauthorizedError("User no longer exists");
    }

    if (!user.isActive) {
        throw new ForbiddenError("User account is deactivated");
    }

    req.user = user;
    next();
});

/**
 * Alias for authenticate middleware
 */
export const protect = authenticate;

/**
 * Authorization Middleware
 * Verifies that the authenticated user matches allowed criteria or roles
 * @param  {...string} roles - Optional list of allowed roles
 */
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new UnauthorizedError("Authentication required"));
        }

        if (roles.length > 0 && !roles.includes(req.user.role)) {
            return next(
                new ForbiddenError("You do not have permission to perform this action")
            );
        }

        next();
    };
};
