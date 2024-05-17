import dotenv from "dotenv";
import nodemailer, { TransportOptions } from "nodemailer";

dotenv.config();

interface CustomTransportOptions extends TransportOptions {
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: {
        user: string;
        pass: string;
    };
}

const sendEmail = async function (email: string, subject: string, message: string) {
    // Define the transporter options
    const transporterOptions: CustomTransportOptions = {
        host: process.env.SMTP_HOST,
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: "sahilnodemailer15@gmail.com",
            pass: "ozcjfxldsgszlmtp",
        },
    };

    // Create the transporter
    let transporter = nodemailer.createTransport(transporterOptions);

    try {
        // Send mail with defined transport object
        await transporter.sendMail({
            from: "sahilnodemailer15@gmail.com",
            to: email,
            subject: subject,
            html: message,
        });
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

export default sendEmail;
