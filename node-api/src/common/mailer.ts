import nodemailer from 'nodemailer';
import { DataSource } from 'typeorm';
import { CustomError } from './error/customError';

export class Mailer{

    async sendMail(to:string,subject:string,text:string){
        let transporter = nodemailer.createTransport({
            service: 'gmail', // Use your email service provider here
            auth: {
                user: process.env.EMAIL, // Your email address
                pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password
            },
        });
        try {
            // Send mail with defined transport object
            await transporter.sendMail({
                from: `"Your Name" <${process.env.EMAIL}>`, // Sender address
                to, // List of receivers
                subject, // Subject line
                text, // Plain text body
            });
            return true
        } catch (error) {
            throw new CustomError(500, 'Error sending email. Please try again later', error as string)
        }
    }

}