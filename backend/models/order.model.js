import mongoose from "mongoose";

/**
 * The order schema defines the shape of the documents stored in the
 * "orders" collection in the MongoDB database.
 *
 * The schema has the following fields:
 *
 * - user: A reference to the User document that placed the order.
 *   This field is required and must be an ObjectId.
 *
 * - products: An array of objects representing the products in the order.
 *   Each object in the array must have the following properties:
 *
 * - totalAmount: The total amount of the order. This field is required
 *   and must be a positive number.
 *
 * - stripeSessionId: The ID of the Stripe session that was used to
 *   process the order. This field is required and must be a unique string.
 */
const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    stripeSessionId: {
        type: String,
        unique: true
    }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

export default Order;