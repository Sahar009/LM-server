import nodemailer, { Transporter } from 'nodemailer'
import ejs from 'ejs'
import path from 'path'
require('dotenv').config()

interface EmailOptions {
    email: string;
    subject: string;
    template: string;
    data: { [key: string]: any }
}


const sendMail = async (options: EmailOptions): Promise<void> => {
    const transporter: Transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });
const { email, subject, template, data } = options;

// get the path of the mail template fil

const templatePath = path.join(__dirname, '../mails', template)
// /rende the email template wiith ejs
const html: string = await ejs.renderFile(templatePath, data)

const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject,
    html
};
await transporter.sendMail(mailOptions)
}
;

export default sendMail