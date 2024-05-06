import User, {UserDocument} from "../models/userModel";
import crypto from "crypto";
import asyncHandler from "../middlewares/asyncMiddleware";
import appError from "../utils/appError";

const cookieOption: object = {
    secure: process.env.NODE_ENV === 'production' ? true : false,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
};

// @public
// Routes POST /api/v1/users/signup
export const signup = asyncHandler(async (req, res, next) => {
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
export const login = asyncHandler(async(req , res , next) => {
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