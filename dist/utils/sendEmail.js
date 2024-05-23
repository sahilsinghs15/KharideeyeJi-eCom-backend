var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();
const sendEmail = function (email, subject, message) {
    return __awaiter(this, void 0, void 0, function* () {
        // Define the transporter options
        const transporterOptions = {
            host: process.env.SMTP_HOST,
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: "sahilnodemailer15@gmail.com",
                pass: process.env.SMTP_PASSWORD,
            },
        };
        // Create the transporter
        let transporter = nodemailer.createTransport(transporterOptions);
        try {
            // Send mail with defined transport object
            yield transporter.sendMail({
                from: "sahilnodemailer15@gmail.com",
                to: email,
                subject: subject,
                html: message,
            });
        }
        catch (error) {
            console.error("Error sending email:", error);
        }
    });
};
export default sendEmail;
