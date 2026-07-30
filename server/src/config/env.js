import dotenv from 'dotenv'
dotenv.config()

// for checking the env exist or not
function required(name, fallback) {
    const value = process.env[name] ?? fallback
    if (!value)
        throw new Error(`missing env variable ${name}`)
    return value
}

export const env = {
    JWT_ACCESS_SECRET: required("JWT_ACCESS_SECRET", ""),
    JWT_REFRESH_SECRET: required("JWT_REFRESH_SECRET", ""),
    MONGODB_URI: required("MONGODB_URI", "mongodb://localhost:27017/bidnaam"),
    PORT: process.env.PORT || 3001,
    NODE_ENV: process.env.NODE_ENV || "development",
    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
    IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY || "",
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY || "",
    IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT || "",
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_API_KEY || "rzp_test_placeholder",
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET || "rzp_secret_placeholder",
}

export const isProduction = env.NODE_ENV === 'production'