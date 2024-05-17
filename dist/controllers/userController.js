var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import User from "../models/userModel.js";
import crypto from "crypto";
import asyncHandler from "../middlewares/asyncMiddleware.js";
import appError from "../utils/appError.js";
import sendEmail from "../utils/sendEmail.js";
const cookieOption = {
    secure: process.env.NODE_ENV === 'production' ? true : false,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
};
// @public
// Routes POST /api/v1/users/signup
export const signup = asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userName, userEmail, userPassword } = req.body;
    // Check if any required field is missing or null
    if (!userName || !userEmail || !userPassword) {
        return next(new appError("All fields are required ...", 500));
    }
    // Validate the email format
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(userEmail)) {
        return next(new appError("Please provide a valid email address", 500));
    }
    // Check if a user with the same email already exists
    const userExists = yield User.findOne({ userEmail });
    if (userExists) {
        return next(new appError("User already exists, please try with a different email or login with the same email", 409));
    }
    // Create new user with the given necessary details
    const user = yield User.create({
        userName,
        userEmail,
        userPassword,
    });
    // If user not created, send error response
    if (!user) {
        return next(new appError("User registration failed, please try again later", 400));
    }
    // Generate a JWT Token
    const token = yield user.generateJWTToken();
    // Omit the userPassword property from the user object
    const userWithoutPassword = Object.assign(Object.assign({}, user.toObject()), { userPassword: undefined });
    // Setting the token in the cookie with name token along with cookie option
    res.cookie('token', token, cookieOption);
    // If all good, send the response to the frontend
    res.status(200).json({
        success: true,
        message: "User Registered Successfully",
        user: userWithoutPassword // Send the modified user object in the response
    });
}));
// @login
// Route POST {url} = /api/v1/users/login
export const login = asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userEmail, userPassword } = req.body;
    if (!userEmail || !userPassword) {
        return next(new appError("Please enter both email and password...", 400));
    }
    const user = yield User.findOne({ userEmail }).select('+userPassword');
    if (!user || !(yield user.comparePassword(userPassword))) {
        return next(new appError("Email and Password do not match ", 401));
    }
    const token = yield user.generateJWTToken();
    // Omit the userPassword property from the user object
    const userWithoutPassword = Object.assign(Object.assign({}, user.toObject()), { userPassword: undefined });
    res.cookie('token', token, cookieOption);
    res.status(201).json({
        success: true,
        message: "User logged in Successfully",
        user: userWithoutPassword // Send the modified user object in the response
    });
}));
export const logout = asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.cookie('token', null, {
        secure: true,
        maxAge: 0,
        httpOnly: true
    });
    res.status(200).json({
        success: true,
        message: "User Logged Out Successfully",
    });
}));
export const getLoggedUserDetails = asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Ensure that req.user.id exists and is a string
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new appError('User ID not found in request', 400);
        }
        // Find the user by ID
        const user = yield User.findById(req.user.id);
        if (!user) {
            throw new appError('User not found', 404);
        }
        // Send the user details in the response
        res.status(200).json({
            success: true,
            message: 'User details retrieved successfully',
            user: user // You might want to customize the user object before sending it back
        });
    }
    catch (error) {
        next(error);
    }
}));
export const forgetPassword = asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userEmail } = req.body;
    // If no email send email required message
    if (!userEmail) {
        throw new appError("Email is required", 403);
    }
    try {
        // Finding the user via email
        const user = yield User.findOne({ userEmail });
        // If no user found throw the error
        if (!user) {
            throw new appError("User not found enter valid email", 403);
        }
        // Generating Jwt token 
        const resetToken = yield user.generatePasswordResetToken();

        yield user.save();

        console.log("Reset Token : " , resetToken);
        console.log("User with token saved" , user);
        const resetTokenUrl = `${process.env.FRONTEND_URL}/resetPassword${resetToken}`;
        const subject = "Reset Password";
        const message = `You can reset your password by clicking ${resetTokenUrl}`;
        yield sendEmail(userEmail, subject, message);
        // Handle token generation and sending it via email or other logic
        // For now, let's just return the token
        res.status(200).json({
            success: true,
            message: "Token generated successfully",
            token: resetToken
        });
    }
    catch (error) {
        next(error);
    }
}));
export const resetPassword = asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { resetToken } = req.params;

    if(!resetToken){
        throw new appError("Reset Token not found");
    }

    const { newUserPassword } = req.body;
    const forgotPasswordToken = yield crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    try {
        if (!newUserPassword) {
            throw new appError("New password is required to reset the password", 403);
        }
        console.log("Forget Password Token : ", forgotPasswordToken);
        const user = yield User.findOne({
            forgotPasswordToken,
            forgotPasswordExpiry: { $gt: Date.now() },
        });
        if (!user) {
            return next(new appError("Token is invalid or expired , Please try again later", 400));
        }

        console.log("User found with token :" , user);

        user.userPassword = newUserPassword;
        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;
        yield user.save();

        res.json({
            success: true,
            message: "Password changed successfully , Now login with new password",
        });
    }
    catch (e) {
        next(e);
    }
}));
