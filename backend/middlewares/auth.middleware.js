import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

/**
 * Protect routes from unauthorized access
 * This middleware verifies the access token sent in the request by checking its signature and expiration time
 * If the token is valid, it retrieves the user associated with the token and stores it in the request object
 * If the token is invalid or expired, it sends a 401 Unauthorized response with an appropriate error message
 */
export const protectRoute = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            return res.status(401).json({ message: "Unauthorized - No access token provided" });
        }

        try {
            // Verify the access token by checking its signature and expiration time
            const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    
            // Retrieve the user associated with the token 
            const user = await User.findById(decoded.userId).select("-password"); // "-password" excludes the password field from the user document
    
            if (!user) {
                return res.status(401).json({ message: "Unauthorized - User not found" });
            }
    
            // Store the user in the request object
            req.user = user;
    
            // Proceed to the next middleware
            next();

        } catch (error) {
            // Verify if the error is due to token expiration
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Unauthorized - Access token expired" });
            }
            throw error; // Throw the error to be handled by the error handler
        }

    } catch (error) {
        console.log("Error protecting route: ", error.message);
        res.status(401).json({ message: "Unauthorized - Invalid access token", error: error.message });
    }
};

/**
 * This middleware checks if the user making the request is an admin and has the admin role
 * If the user is an admin, it allows the request to proceed to the next middleware
 * If the user is not an admin, it sends a 401 Unauthorized response with a message saying that access is denied
 */
export const adminRoute = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        // If the user is an admin, allow the request to proceed
        next();
    } else {
        // If the user is not an admin, deny access
        res.status(401).json({ message: "Access denied - Admin only" });
    }
};
