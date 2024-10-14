import { stripe } from "../lib/stripe.js";
import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";

/**
 * This function creates a new Stripe checkout session based on the products and coupon code provided.
 * It maps the products array to an array of line items, which are then used to create the checkout session.
 * The function also calculates the total amount of the purchase, taking into account the discount percentage of the coupon.
 * If the total amount of the purchase is greater than or equal to 200 USD, it creates a new coupon for the user.
 * The function returns the newly created checkout session, including the session ID and total amount.
 */
export const createCheckoutSession = async (req, res) => {
    try {
        const { products, couponCode } = req.body;

        // Validate request body
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: "Invalid or empty products array" });
        }

        let totalAmount = 0;

        // Map the products array to an array of line items and calculate the total amount
        const lineItems = products.map(product => {
            const amount = Math.round(product.price * 100); // Stripe expects amount in cents
            totalAmount += amount * product.quantity;

            // Stripe expects this format:
            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: product.name,
                        images: [product.image]
                    },
                    unit_amount: amount
                },
                quantity: product.quantity || 1 
            };
        });

        let coupon = null;

        // Check if coupon code is valid 
        if (couponCode) {
            coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });

            // If coupon code is valid, apply discount
            if (coupon) {
                totalAmount = Math.round(totalAmount * coupon.discountPercentage / 100);
            }
        }

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"], // We can add more payment methods like PayPal, Apple Pay, etc.
            line_items: lineItems,
            mode: "payment", // We can establish other payment modes like subscription, setup, etc.
            success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
            discounts: coupon
				? [
						{
							coupon: await createStripeCoupon(coupon.discountPercentage),
						},
				  ]
				: [],
            metadata: {
                userId: req.user._id.toString(), // _id is a Mongoose ObjectId
                couponCode: couponCode || "",
                products: JSON.stringify(
                    products.map(product => ({
                        id: product._id,
                        quantity: product.quantity,
                        price: product.price
                    }))
                )
            } // metadata is used to store additional info about the session that can be used to retrieve it later
        });

        // Create new coupon if total amount is greater than or equal to 200 USD
        if (totalAmount >= 20000) { // 200 USD
            await createNewCoupon(req.user._id);
        }

        res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });

    } catch (error) {
        console.log("Error creating checkout session: ", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * This function processes a successful checkout session.
 * It takes the session ID as a request body parameter and retrieves the corresponding Stripe checkout session.
 * If the session has been paid, it deactivates any coupon used and creates a new Order document in the database.
 * The function returns a 200 response with a success message if the order is successfully created and the coupon is deactivated, or a 500 response if there is an error.
 */
export const checkoutSuccess = async (req, res) => {
    try {
        const { sessionId } = req.body;

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // Check if session has been paid
        if (session.payment_status === "paid") {

            // Deactivate coupon if used
            if (session.metadata.couponCode) {
                await Coupon.findOneAndUpdate({
                    code: session.metadata.couponCode,
                    userId: session.metadata.userId
                }, {
                    isActive: false
                })
            }

            // Create new order
            const products = JSON.parse(session.metadata.products);
            const newOrder = new Order({
                user: session.metadata.userId,
                products: products.map(product => ({
                    product: product.id,
                    quantity: product.quantity,
                    price: product.price
                })),
                totalAmount: session.amount_total / 100,
                stripeSessionId: sessionId
            });

            await newOrder.save();
            res.status(200).json({ 
                success: true,
                message: "Payment succesfully, order created successfully and coupon deactivated if used",
                orderId: newOrder._id
             });
        }

    } catch (error) {
        console.log("Error processing checkout session: ", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// UTILITY FUNCTIONS
// These could be in another folder and files, but I've kept them here for simplicity

/**
 * This function creates a Stripe coupon based on the discount percentage provided.
 * The coupon is a "once" coupon, meaning it can only be used once.
 * The function returns the newly created coupon.
 */
const createStripeCoupon = async (discountPercentage) => {
    const coupon = await stripe.coupons.create({
        percent_off: discountPercentage,
        duration: "once",
    });

    return coupon.id;
};

/**
 * This function creates a new coupon document in the database and returns it.
 * The coupon has the following properties:
 * - code: A random string of 6 characters, starting with "GIFT" and followed by 5 random characters.
 * - discountPercentage: 10
 * - expirationDate: The current time plus 30 days
 * - userId: The ID of the user who the coupon belongs to
 * The function creates a new Coupon document, saves it to the database, and returns it.
 */
const createNewCoupon = async (userId) => {
    await Coupon.findOneAndDelete({ userId });
    const newCoupon = new Coupon({
        code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        discountPercentage: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        userId: userId
    });

    await newCoupon.save();

    return newCoupon;
};