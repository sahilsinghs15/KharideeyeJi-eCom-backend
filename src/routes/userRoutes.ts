import { NextFunction, Response, Router } from "express";
import { signup, login, logout, forgetPassword, resetPassword } from "../controllers/userController";
import asyncHandler, { requestAuth } from "../middlewares/asyncMiddleware"; // Correct import path

const router = Router();

router.post("/register", asyncHandler(async (req: requestAuth, res: Response<any, Record<string, any>>, next: NextFunction) => {
    await signup(req, res, next); // Call signup function with req, res, and next parameters
}));

router.post("/login", asyncHandler(async (req: requestAuth, res: Response<any, Record<string, any>>, next: NextFunction) => {
    await login(req, res, next); // Call login function with req, res, and next parameters
}));

router.post("/logout" , asyncHandler(async (req : requestAuth , res : Response<any, Record<string, any>> , next : NextFunction)=>{
    await logout(req, res, next);
}))

router.get("/forgetPassword" , asyncHandler(async (req : requestAuth , res : Response<any, Record<string, any>> , next : NextFunction)=>{
    await forgetPassword(req, res, next);
}))

router.post("/resetPassword/:resetToken" , asyncHandler(async (req : requestAuth , res : Response<any, Record<string, any>> , next : NextFunction)=>{
    await resetPassword(req, res, next);
}))

export default router;
