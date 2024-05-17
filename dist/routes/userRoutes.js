var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Router } from "express";
import { signup, login, logout, forgetPassword, resetPassword } from "../controllers/userController.js";
import asyncHandler from "../middlewares/asyncMiddleware.js"; // Correct import path
const router = Router();
router.post("/register", asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield signup(req, res, next); // Call signup function with req, res, and next parameters
})));
router.post("/login", asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield login(req, res, next); // Call login function with req, res, and next parameters
})));
router.post("/logout", asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield logout(req, res, next);
})));
router.post("/forgetPassword", asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield forgetPassword(req, res, next);
})));
router.post("/resetPassword/:resetToken", asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield resetPassword(req, res, next);
})));
export default router;
