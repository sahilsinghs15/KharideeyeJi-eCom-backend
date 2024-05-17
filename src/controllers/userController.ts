
import User, {UserDocument} from "../models/userModel";
import crypto from "crypto";
import asyncHandler from "../middlewares/asyncMiddleware";
import appError from "../utils/appError";
import sendEmail from "src/utils/sendEmail";
import { requestAuth } from "../middlewares/asyncMiddleware";
import { NextFunction, Response } from "express";


const cookieOption: object = {
    secure: process.env.NODE_ENV === 'production' ? true : false,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
};

// @public
// Routes POST /api/v1/users/signup
export const signup = asyncHandler(async (req : requestAuth, res: Response<any, Record<string, any>>, next : NextFunction) => {
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
    const userExists = await User.findOne({ userEmail });

    if (userExists) {
        return next(new appError("User already exists, please try with a different email or login with the same email", 409));
    }

    // Create new user with the given necessary details
    const user = await User.create({
        userName,
        userEmail,
        userPassword,
    });

    // If user not created, send error response
    if (!user) {
        return next(new appError("User registration failed, please try again later", 400));
    }

    // Generate a JWT Token
    const token: string = await user.generateJWTToken();

    // Omit the userPassword property from the user object
    const userWithoutPassword = { ...user.toObject(), userPassword: undefined };

    // Setting the token in the cookie with name token along with cookie option
    res.cookie('token', token, cookieOption);

    // If all good, send the response to the frontend
    res.status(200).json({
        success: true,
        message: "User Registered Successfully",
        user: userWithoutPassword // Send the modified user object in the response
    });
});

// @login
// Route POST {url} = /api/v1/users/login
export const login = asyncHandler(async(req : requestAuth, res: Response<any, Record<string, any>>, next : NextFunction) => {
    const { userEmail , userPassword } = req.body;

    if(!userEmail || !userPassword){
        return next(new appError("Please enter both email and password..." , 400));
    }

    const user = await User.findOne({ userEmail }).select('+userPassword');

    if(!user || !(await user.comparePassword(userPassword))){
        return next(new appError("Email and Password do not match " , 401 ));
    }

    const token = await user.generateJWTToken();

    // Omit the userPassword property from the user object
    const userWithoutPassword = { ...user.toObject(), userPassword: undefined };

    res.cookie('token' , token , cookieOption);

    res.status(201).json({
        success : true,
        message : "User logged in Successfully",
        user: userWithoutPassword // Send the modified user object in the response
    });
});


export const logout = asyncHandler(async(req : requestAuth, res: Response<any, Record<string, any>>, next : NextFunction)=>{
    res.cookie('token' , null , {
        secure : true,
        maxAge : 0,
        httpOnly : true
    })

    res.status(200).json({
        success : true,
        message : "User Logged Out Successfully",
    })
});



export const getLoggedUserDetails = asyncHandler(async (req : requestAuth, res: Response<any, Record<string, any>>, next : NextFunction) => {
    try {
        // Ensure that req.user.id exists and is a string
        if (!req.user?.id) {
            throw new appError('User ID not found in request', 400);
        }

        // Find the user by ID
        const user = await User.findById(req.user.id);

        if (!user) {
            throw new appError('User not found', 404);
        }

        // Send the user details in the response
        res.status(200).json({
            success: true,
            message: 'User details retrieved successfully',
            user: user // You might want to customize the user object before sending it back
        });
    } catch (error) {
        next(error);
    }
});


export const forgetPassword = asyncHandler(async (req : requestAuth, res: Response<any, Record<string, any>>, next : NextFunction) => {
    const { userEmail } = req.body;

    // If no email send email required message
    if (!userEmail) {
        throw new appError("Email is required", 403);
    }

    try {
        // Finding the user via email
        const user = await User.findOne({ userEmail });

        // If no user found throw the error
        if (!user) {
            throw new appError("User not found enter valid email", 403);
        }

        // Generating Jwt token 
        const resetToken = await user.generatePasswordResetToken();

        const resetTokenUrl = `${process.env.FRONTEND_URL}/reset-password ${resetToken}`;

        const subject = "Reset Password";
        const message = `You can reset your password by clicking ${resetTokenUrl}`;


        await sendEmail(userEmail , subject , message);

        // Handle token generation and sending it via email or other logic
        // For now, let's just return the token
        res.status(200).json({
            success: true,
            message: "Token generated successfully",
            token: resetToken
        });
    } catch (error) {
        next(error);
    }
});


export const resetPassword = asyncHandler(async( req : requestAuth, res: Response<any, Record<string, any>>, next : NextFunction )=>{

    const {resetToken} = req.params;

    const {newUserPassword } = req.body;

    const forgetPasswordToken = await crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')


    try{

        if(!newUserPassword){
            throw new appError("New password is required to reset the password" , 403);
        }

        console.log("Forget Password Token : ",forgetPasswordToken);

        const user = await User.findOne({
            forgotPasswordToken : forgetPasswordToken,
            forgotPasswordExpiry : {$gt : Date.now()},
        })

        if(!user){
            return next (
                new appError("Token is invalid or expired , Please try again later",400)
            )
        }

        user.userPassword = newUserPassword;

        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;

        user.save();

        res.json({
            success : true,
            message : "Password changed successfully , Now login with new password",
        })

    }catch(e){
        res.json({
            success : false,
            message : "Something Bad occurred ,try again later " , e, 
        })
    }
})

