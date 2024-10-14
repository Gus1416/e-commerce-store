import express from "express";
import { createProduct, deleteProduct, getAllProducts, getFeaturedProducts, getProductsByCategory, getRecommendedProducts, toggleFeaturedProduct } from "../controllers/product.controller.js";
import { adminRoute, protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * Routes with protectRoute middleware are protected routes (for authenticated users)
 * Routes with adminRoute middleware are only accessible by admins
 * Routes with no middleware are public routes
 */
router.get("/", protectRoute, adminRoute, getAllProducts);      
router.get("/featured", getFeaturedProducts);
router.get("/recommended", getRecommendedProducts);     
router.get("/category/:category", getProductsByCategory);        
router.post("/", protectRoute, adminRoute, createProduct);
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct); //patch is used to update a single field, put is for multiple
router.delete("/:id", protectRoute, adminRoute, deleteProduct); 

export default router;