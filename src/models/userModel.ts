import { Schema, model, Document, Model } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

// Define the interface representing the user document
export interface UserDocument extends Document {
    userName: string;
    userEmail: string;
    userPassword: string;
    userAddress?: string;
    userContactNo?: number;
    userAvatar?: {
        public_id?: string;
        secure_url?: string;
    };
    forgotPasswordToken?: string;
    forgotPasswordExpiry?: Date | number;
    comparePassword(plainPassword: string): Promise<boolean>;
    generatePasswordResetToken(): string;
    generateJWTToken(): string;
}

// Define the interface representing the user model
interface UserModel extends Model<UserDocument> {}

// Define the user schema
const userSchema = new Schema<UserDocument, UserModel>({
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
userSchema.pre<UserDocument>('save', async function (next) {
    // If password is not modified, do not hash it
    if (!this.isModified('userPassword')) return next();
    this.userPassword = await bcrypt.hash(this.userPassword, 10);
});

// Define instance methods
userSchema.methods = {
    // Method to compare plain password with hashed password and returns true or false
    comparePassword: async function (this: UserDocument, plainPassword: string) {
        return await bcrypt.compare(plainPassword, this.userPassword);
    },
    // Method to generate password reset token
    generatePasswordResetToken: function (this: UserDocument) {
        const resetToken = crypto.randomBytes(20).toString('hex');
        this.forgotPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
        return resetToken;
    },
    // Method to generate a JWT token with user id as payload
    generateJWTToken: function (this: UserDocument) {
        if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRY) {
            throw new Error("JWT Secret or Expiry Not defined!");
        }
        return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY });
    },
};

// Define the User model using the schema
const User = model<UserDocument>('User', userSchema);

export default User;
