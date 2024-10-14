import Coupon from "../models/coupon.model.js"

/**
 * This function returns the coupon associated with the authenticated user.
 * It queries the database using the authenticated user's ID and the isActive field set to true.
 * If the coupon is found, it returns a 200 response with the coupon object.
 * If no coupon is found (i.e. the user has no active coupon), it returns a 200 response with null.
 * If there is an error, it logs the error and sends a 500 response with an error message.
 */
export const getCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findOne({ userId: req.user._id, isActive: true });
        res.status(200).json(coupon || null); // Return coupon or null if not found
    } catch (error) {
        console.log("Error getting coupon: ", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * This function validates a coupon code for the authenticated user.
 * It takes a JSON body with a single field, code, which is the coupon code to be validated.
 * It queries the database for a coupon with the given code, associated with the authenticated user, and with the isActive field set to true.
 * If the coupon is not found, it returns a 404 response with a message "Coupon not found".
 * If the coupon is found, it checks if the expiration date is in the past.
 * If the coupon has expired, it returns a 400 response with a message "Coupon expired".
 * If the coupon is valid, it returns a 200 response with the coupon code, discount percentage, and a message "Coupon valid".
 * If there is an error, it logs the error and sends a 500 response with an error message.
 */
export const validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        const coupon = await Coupon.findOne({ code: code, userId: req.user._id, isActive: true });

        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        if (coupon.expirationDate < Date.now()) {
            return res.status(400).json({ message: "Coupon expired" });
        }

        res.status(200).json({
            message: "Coupon valid",
            code: coupon.code,
            discountPercentage: coupon.discountPercentage
        });

    } catch (error) {
        console.log("Error validating coupon: ", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
