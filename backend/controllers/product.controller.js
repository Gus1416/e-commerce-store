import { redis } from "../lib/redis.js";
import Product from "../models/product.model.js"
import cloudinary from "../lib/cloudinary.js";

// Get all products from the database
export const getAllProducts = async (req,res) => {
    try {
        const products = await Product.find({}); // Find all products in the database
        res.status(200).json({ products }); 
    } catch (error) {
        console.log("Error getting all products: ", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get featured products
/**
 * This function retrieves the featured products from the database and caches them in Redis for faster retrieval.
 * If the featured products are already cached in Redis, it retrieves them from Redis.
 * If not, it retrieves the featured products from the database and caches them in Redis.
 * The function then returns the featured products in the response as JSON.
 * If there is an error, the function logs the error and sends a 500 response with an error message.
 */
export const getFeaturedProducts = async (req, res) => {
    try {
        // Check if the featured products are already cached in Redis
        let featuredProducts = await redis.get("featured_products");
        if (featuredProducts) {
            // If they are, parse the cached JSON and return it in the response
            return res.status(200).json(JSON.parse(featuredProducts));
        }

        // If not, retrieve the featured products from the database
        featuredProducts = await Product.find({ isFeatured: true }).lean(); // lean() is used to convert the Mongoose documents to plain JavaScript objects
        if (!featuredProducts) {
            return res.status(404).json({ message: "No featured products found" });
        }

        // Cache the featured products in Redis
        await redis.set("featured_products", JSON.stringify(featuredProducts));
        res.status(200).json(featuredProducts);

    } catch (error) {
        console.log("Error getting featured products: ", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Create a new product
/**
 * This function creates a new product in the database with the given name, description, price, image, and category.
 * If an image is provided, it is uploaded to Cloudinary and the returned URL is stored in the database.
 * If no image is provided, the image field in the database is set to an empty string.
 * The function then returns the newly created product in the response as JSON.
 * If there is an error, the function logs the error and sends a 500 response with an error message.
 */
export const createProduct = async (req, res) => {
    try {
        const { name, description, price, image, category } = req.body;

        let cloudinaryResponse = null;

        // If an image is provided, upload it to Cloudinary
        if (image) {
            cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products" });
        }

        // Create the product in the database
        const product = await Product.create({
            name,
            description,
            price,
            // If an image was uploaded, use the returned URL, otherwise set the image field to an empty string
            image: cloudinaryResponse?.secure_url || "",
            category,
        });

        res.status(201).json({ message: "Product created successfully", product }); // Example response: { message: "Product created successfully", product: { ... }

    } catch (error) {
        console.log("Error creating product: ", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete a product
/**
 * Delete a product from the database.
 * If the product has an image, delete the image from Cloudinary.
 * If the product is found, delete it from the database.
 * Return a 200 response with a message saying that the product was deleted successfully.
 * If there is an error, log the error and send a 500 response with an error message.
 */
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        // If the product has an image, delete it from Cloudinary
        if (product.image) {
            // Extract the public ID from the image URL
            const publicId = product.image.split("/").pop().split(".")[0];         
            try {
                // Use the Cloudinary API to delete the image
                await cloudinary.uploader.destroy(`products/${publicId}`);
                console.log("Product image deleted from Cloudinary");

            } catch (error) {
                // If there is an error deleting the image, log the error
                console.error("Error deleting product image from Cloudinary:", error.message);
            }
        }
        
        // Delete the product from the database
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Product deleted successfully" });

    } catch (error) {
        console.log("Error deleting product: ", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get recommended products
/**
 * Get 3 random products from the database to display as recommendations.
 * Uses the $sample aggregation operator to select 3 random documents from the collection.
 * Uses the $project aggregation operator to select only the fields we need for the frontend.
 * Returns a 200 response with the 3 recommended products in the response body.
 * If there is an error, logs the error and sends a 500 response with an error message.
 */
export const getRecommendedProducts = async (req, res) => {
    try {
        const products = await Product.aggregate([
            {
                $sample: { size: 4 }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    price: 1,
                    image: 1
                }
            }
        ]);

        res.status(200).json(products);

    } catch (error) {
        console.log("Error getting recommended products: ", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get products by category
export const getProductsByCategory = async (req, res) => {
    const { category } = req.params;
    try {
        const products = await Product.find({ category });
        res.status(200).json({ products });
    } catch (error) {
        console.log("Error getting products by category: ", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Toggle featured product
/**
 * Toggles the isFeatured field of a product.
 * If the product is found, this function toggles the isFeatured field and saves the product to the database.
 * It then calls the updateFeaturedProductsCache function to update the cache of featured products in Redis.
 * If the product is not found, the function returns a 404 response with a message saying that the product was not found.
 * If there is an error, the function logs the error to the console.
 */
export const toggleFeaturedProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            product.isFeatured = !product.isFeatured;
            const updatedProduct = await product.save();
            await updateFeaturedProductsCache();
            res.status(200).json(updatedProduct);
        } else {
            res.status(404).json({ message: "Product not found" });
        }

    } catch (error) {
        console.log("Error toggling featured product: ", error.message);
    }
};

// Update featured products cache
/**
 * This function is used to update the cache of featured products in Redis.
 * It finds all products in the database with the isFeatured field set to true and stores them in the Redis cache with the key "featured_products".
 * The products are stored as a JSON string.
 * If there is an error, the error is logged to the console.
 */
const updateFeaturedProductsCache = async () => {
    try {
        // Find all products with isFeatured set to true
        const featuredProducts = await Product.find({ isFeatured: true }).lean();
        // Store the products in the Redis cache as a JSON string
        await redis.set("featured_products", JSON.stringify(featuredProducts));
    } catch (error) {
        console.log("Error updating featured products cache: ", error.message);
    }
};
