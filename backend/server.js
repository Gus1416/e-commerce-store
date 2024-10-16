import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import authRoute from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import path from "path";
import cors from "cors";

// Load environment variables from .env
dotenv.config();

// Set port number or use default
const PORT = process.env.PORT || 5000;

// Create express app
const app = express();

// Set the path to the current directory
const __dirname = path.resolve();

// Middleware
app.use(express.json({ limit: "10mb" })); // Parse JSON request bodies
app.use(cookieParser()); // Parse cookies
app.use(cors({
    origin: "https://e-commerce-store-s83s.vercel.app"
}))

// Routes
app.use("/api/auth", authRoute);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

// If in production mode, serve static files from the frontend
// This serves the pre-built React app from the frontend/dist folder
// The "*" route is a catch-all route that will serve the index.html file
// for any route that is not explicitly defined in the app
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "/frontend/dist"))); // Serve static files

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html")); // Serve the index.html file for any route that is not defined in the app
    });
}

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log("Server is running on port", PORT);
    connectDB(); // Connect to MongoDB
});