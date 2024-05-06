var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Schema, model } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
// Define the user schema
const userSchema = new Schema({
    userName: {
        type: String,
        required: [true, "UserName is Required..."],
        minlength: [6, "The length of the userName is short, It should be at least 6"],
        lowercase: true,
        trim: true,
    },
    userEmail: {
        type: String,
        required: [true, "Email is required..."],
        lowercase: true,
        trim: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please fill in a valid email address",
        ],
    },
    userPassword: {
        type: String,
        required: [true, "Password is required..."],
        minlength: [10, "Password should be at least 10 letters long"],
        trim: true,
        select: false,
    },
    userAddress: {
        type: String,
        trim: true,
    },
    userContactNo: {
        type: Number,
        trim: true,
        match: [/^(\+\d{1,3}[- ]?)?\d{10}$/, "Please fill correct contact number..."],
    },
    userAvatar: {
        type: String,
        public_id: String,
        secure_url: String,
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
}, {
    timestamps: true,
});
// Hashes password before saving to the database
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        // If password is not modified, do not hash it
        if (!this.isModified('userPassword'))
            return next();
        this.userPassword = yield bcrypt.hash(this.userPassword, 10);
    });
});
// Define instance methods
userSchema.methods = {
    // Method to compare plain password with hashed password and returns true or false
    comparePassword: function (plainPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield bcrypt.compare(plainPassword, this.userPassword);
        });
    },
    // Method to generate password reset token
    generatePasswordResetToken: function () {
        const resetToken = crypto.randomBytes(20).toString('hex');
        this.forgotPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
        return resetToken;
    },
    // Method to generate a JWT token with user id as payload
    generateJWTToken: function () {
        if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRY) {
            throw new Error("JWT Secret or Expiry Not defined!");
        }
        return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY });
    },
};
// Define the User model using the schema
const User = model('User', userSchema);
export default User;
