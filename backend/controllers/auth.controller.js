import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

// Generate access and refresh token with JWT
/**
 * Access token and refresh token explanation
 * 
 * Access token is a JSON Web Token (JWT) that is used to authenticate a user and grant access to protected resources.
 * It is sent in the Authorization header of each request to protected resources.
 * The access token is short-lived (15 minutes) and is used to request a new access token when it is close to expiring.
 * 
 * Refresh token is a JSON Web Token (JWT) that is used to obtain a new access token when the current one expires.
 * It is sent in the Authorization header of the request to obtain a new access token.
 * The refresh token is long-lived (7 days) and is used to request a new access token when the previous one expires.
 * 
 * The access token is used to authenticate and authorize requests to protected resources, while the refresh token is used to obtain a new access token when the previous one expires.
 */
const generateToken = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { 
        expiresIn: "15m" 
    }); 

    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { 
        expiresIn: "7d" 
    });

    return { accessToken, refreshToken };
};

// Store refresh token in Redis with expiration time of 7 days
const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60);
};

// Set cookies with access and refresh token
/**
 * A cookie is a small piece of data stored on the user's computer by the web browser while browsing a website.
 * It is sent in the request headers to the server when the user visits the website.
 * It is used to authenticate a user and grant access to protected resources.
 * The cookie is set with the 'Set-Cookie' header in the response from the server.
 * The cookie is stored in the browser's memory and is deleted when the user closes the browser.
 * In this case, the cookie is set with the 'httpOnly' flag, which means that the cookie is not accessible from client-side JavaScript.
 * The cookie is also set with the 'secure' flag, which means that the cookie is only sent over HTTPS in production, not in development or test.
 * The cookie is also set with the 'sameSite' flag, which means that the cookie is only sent to the website that set the cookie.
 * The cookie is also set with the 'maxAge' property, which means that the cookie is deleted after a certain period of time.
 */
const setCookies = (res, accessToken, refreshToken) => {    
    res.cookie("accessToken", accessToken, {
        httpOnly: true, // Prevent XSS attack, Cross-Site-Scripting attack
        secure: process.env.NODE_ENV === "production", // Only send cookie over HTTPS in production, not in development or test
        sameSite: "strict", // Prevent CSRF (Cross-Site-Request-Forgery) attack
        maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", 
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
};

// Signup a user
/**
 * This function creates a new user in the database and returns a JSON response with the user's details.
 * The user's password is hashed using bcrypt before it is stored in the database.
 * The function also generates an access token and a refresh token using JWT and stores the refresh token in Redis.
 * The tokens are then set in the response as cookies.
 * If the user already exists, the function returns a 400 error with a message saying that the user already exists.
 */
export const signup = async (req, res) => {
    const { name, email, password } = req.body;
    
    try {
        const userExist = await User.findOne({ email }); 
        if (userExist) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({ name, email, password }); // Create and save user to database

        const { accessToken, refreshToken } = generateToken(user._id);
        await storeRefreshToken(user._id, refreshToken);
        setCookies(res, accessToken, refreshToken);

        res.status(201).json({ 
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }, 
            message: "User created successfully" 
        });

    } catch (error) {
        console.log("Error signing up: ", error.message);
        res.status(500).json({ message: error.message });
    }
};

// Login a user
/**
 * This function is called when the user requests to login
 * The function first verifies the user's email and password
 * If the email and password are valid, the function generates an access token and a refresh token using JWT
 * The refresh token is then stored in Redis
 * The access token and refresh token are then set in the response as cookies
 * If the email or password are invalid, the function sends a 401 response with a message saying that the email or password are invalid
 * If there is an error, the function sends a 500 response with an error message 
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.comparePassword(password))) {
            const { accessToken, refreshToken } = generateToken(user._id);
            await storeRefreshToken(user._id, refreshToken);
            setCookies(res, accessToken, refreshToken);

            res.status(200).json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                message: "Login successful"
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }

    } catch (error) {
        console.log("Error logging in: ", error.message);
        res.status(500).json({ message: error.message });
    }
};

// Logout a user
/** 
 * This function is called when the user requests to logout
 * The function first checks if there is a refreshToken cookie in the request
 * If there is, the function verifies the refreshToken using the REFRESH_TOKEN_SECRET
 * If the refreshToken is valid, the function deletes the refreshToken from Redis
 * Then, the function clears the accessToken and refreshToken cookies from the response
 * Finally, the function sends a 200 response with a message saying that the logout was successful
 * If there is an error, the function sends a 500 response with an error message 
 */
export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken; // cookie-parser mw is used to extract the refreshToken from the request
        if (refreshToken) {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            await redis.del(`refresh_token:${decoded.userId}`); // Delete refresh token from Redis
        }

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.status(200).json({ message: "Logout successful" });

    } catch (error) {
        console.log("Error logging out: ", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


/**
 * This function is called when the user's access token has expired and the user has a valid refresh token.
 * The function first checks if there is a refreshToken cookie in the request.
 * If there is, the function verifies the refreshToken using the REFRESH_TOKEN_SECRET.
 * If the refreshToken is valid, the function gets the stored refreshToken from Redis.
 * If the refreshToken in the request matches the stored refreshToken, the function generates a new accessToken using the ACCESS_TOKEN_SECRET and the user's ID.
 * The function then sets the new accessToken as a cookie in the response with the same configuration as the original accessToken.
 * Finally, the function sends a 200 response with a message saying that the token was refreshed successfully.
 * If there is an error, the function sends a 500 response with an error message.
 */
export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: "No refresh token found" });
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const storedToken = await redis.get(`refresh_token:${decoded.userId}`);
        if (refreshToken !== storedToken) {
            return res.status(401).json({ message: "Invalid refresh token" });
        }

        const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, { 
            expiresIn: "15m" 
        });

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000
        });

        res.status(200).json({ message: "Token refreshed successfully" });

    } catch (error) {
        console.log("Error refreshing token: ", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * This function returns the user's profile information in the response.
 * The function first attempts to return a 200 response with the user's profile information.
 * If there is an error, the function logs the error and sends a 500 response with an error message.
 */
export const getProfile = async (req, res) => {
    try {
        res.status(200).json({ user: req.user });
    } catch (error) {
        console.log("Error getting profile: ", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};