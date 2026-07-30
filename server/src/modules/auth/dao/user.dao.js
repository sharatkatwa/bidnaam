import User from "../../../models/user.model.js";

/**
 * Create a new user in the database
 * @param {Object} userData - User creation data ({ email, password })
 * @returns {Promise<Object>} Created user document
 */
export const createUser = async (userData) => {
    return await User.create(userData);
};

/**
 * Find user by email address
 * @param {string} email - User email
 * @param {boolean} selectPassword - Whether to include password field in result
 * @returns {Promise<Object|null>} User document if found
 */
export const findUserByEmail = async (email, selectPassword = false) => {
    const query = User.findOne({ email: email.toLowerCase() });
    if (selectPassword) {
        query.select("+password");
    }
    return await query.exec();
};

/**
 * Find user by ID
 * @param {string} userId - User Mongoose ObjectId
 * @returns {Promise<Object|null>} User document if found
 */
export const findUserById = async (userId) => {
    return await User.findById(userId).exec();
};

/**
 * Update user document by ID
 * @param {string} userId - User Mongoose ObjectId
 * @param {Object} updateData - Data fields to update
 * @returns {Promise<Object|null>} Updated user document
 */
export const updateUser = async (userId, updateData) => {
    return await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
    }).exec();
};
