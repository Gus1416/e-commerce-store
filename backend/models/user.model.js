import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/**
 * User model
 * @module User
 * @requires mongoose
 * @requires Schema
 *
 * @property {String} name - User's name
 * @property {String} email - User's email
 * @property {String} password - User's password
 * @property {Array} cartItems - Array of cart items
 * @property {ObjectId} role - User's role (admin or customer)
 */
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"] // [condition, message]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true // Remove whitespace from both ends
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"]
    },
    cartItems: [{
        quantity: {
            type: Number,
            default: 1
        },
        product: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Product" // Reference to Product model
        }
    }],
    role: {
        type: String,
        enum: ["admin", "customer"], 
        default: "customer"
    }
}, {
    timestamps: true //createdAt, updatedAt
})

// Hash the user's password before saving it to the database
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next(); 
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// This is an instance method that can be called on an instance of the User model
// Compare the user's password with the hashed password in the database to check if it's correct
// This method is used to authenticate the user when they log in
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Create a Mongoose model based on the userSchema
// This model is used to interact with the "users" collection in the MongoDB database
const User = mongoose.model("User", userSchema);

export default User;