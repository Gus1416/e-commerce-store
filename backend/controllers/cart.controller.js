import Product from "../models/product.model.js";

/**
 * This function adds a product to the user's cart.
 * The function first retrieves the authenticated user from the request object.
 * It then checks if the product is already in the user's cart by finding the product ID in the user's cart items.
 * If the product is already in the cart, the function increments the quantity of the item by 1.
 * If the product is not in the cart, the function adds the product ID to the user's cart items.
 * The function then saves the updated user to the database.
 * Finally, the function returns a 200 response with the user's updated cart items.
 * If there is an error, the function logs the error and sends a 500 response with an error message.
 */
export const addToCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = req.user; // Authenticated user from middleware

        const existingItem = user.cartItems.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            user.cartItems.push(productId); // Quantity is set to 1 by default
        }

        await user.save();
        res.status(200).json(user.cartItems);

    } catch (error) {
        console.error("Error adding product to cart:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * This function removes all products from the user's cart or removes a specific product from the user's cart.
 * The function first retrieves the authenticated user from the request object.
 * If no product ID is provided in the request body, the function sets the user's cart items to an empty array.
 * If a product ID is provided, the function filters the user's cart items to remove the item with the matching ID.
 * The function then saves the updated user to the database.
 * Finally, the function returns a 200 response with the user's updated cart items.
 * If there is an error, the function logs the error and sends a 500 response with an error message.
 */
export const removeAllFromCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = req.user;
        if (!productId) {
            user.cartItems = [];
        } else {
            user.cartItems = user.cartItems.filter(item => item.id !== productId); 
        }

        await user.save();
        res.status(200).json(user.cartItems);

    } catch (error) {
        console.error("Error removing product from cart:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * This function updates the quantity of a product in the user's cart.
 * The function takes the ID of the product to update and the new quantity as parameters.
 * It first retrieves the authenticated user from the request object.
 * It then checks if the product is already in the user's cart by finding the product ID in the user's cart items.
 * If the product is in the cart, the function checks if the new quantity is 0.
 * If it is, the function removes the product from the user's cart by filtering it out of the cart items.
 * If the new quantity is not 0, the function updates the quantity of the product in the user's cart.
 * The function then saves the updated user to the database.
 * Finally, the function returns a 200 response with the user's updated cart items.
 * If the product is not in the cart, the function returns a 404 response with an appropriate error message.
 * If there is an error, the function logs the error and sends a 500 response with an error message.
 */
export const updateQuantity = async (req, res) => {
    try {
        const { id: productId } = req.params; // id from params renamed to productId
        const { quantity } = req.body;
        const user = req.user;

        const existingItem = user.cartItems.find(item => item.id === productId);
        if (existingItem) {
            if (quantity === 0) {
                user.cartItems = user.cartItems.filter(item => item.id !== productId);
                await user.save();
                return res.status(200).json(user.cartItems);
            }

            existingItem.quantity = quantity;
            await user.save();
            res.status(200).json(user.cartItems);

        } else {
            res.status(404).json({ message: "Product not found in cart" });
        }

    } catch (error) {
        console.error("Error updating product quantity:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * This function returns the products in the user's cart, including the quantity of each product.
 * It first retrieves the authenticated user from the request object.
 * It then finds all products in the database with the IDs in the user's cart items.
 * For each product, it finds the quantity in the user's cart items and adds it to the product object.
 * Finally, it returns a 200 response with the products in the user's cart, including the quantity of each product.
 * If there is an error, the function logs the error and sends a 500 response with an error message.
 */
export const getCartProducts = async (req, res) => {
    try {
        // Find all products in the database with the IDs in the user's cart items
        const products = await Product.find({ _id: { $in: req.user.cartItems } }); // products is an array of Mongoose documents
        
        // For each product, find the quantity in the user's cart items and add it to the product object
        const cartItems = products.map(product => {
            const item = req.user.cartItems.find(cartItems => cartItems.id === product.id);
            return {
                // Keep the rest of the product properties, convert to JSON and add the quantity
                ...product.toJSON(), 
                quantity: item.quantity
            } 
        });
        
        res.status(200).json(cartItems); 

    } catch (error) {
        console.error("Error getting cart products:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
