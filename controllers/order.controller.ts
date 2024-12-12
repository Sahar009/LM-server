import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import { IOrder } from "../models/order.model";
import userModel from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import CourseModel from "../models/course.model";
import { getAllOrdersService, newOrder } from "../services/order.service";
import sendMail from "../utils/sendMail";
import path from "path";
import ejs from "ejs";
import NotificationModel from "../models/notification.model";
import { redis } from "../utils/redis";
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Define interfaces
interface ICourse {
    _id: string;
    name: string;
    price: number;
    purchased: number;
    save: () => Promise<ICourse>;
}

interface IUser {
    _id: string;
    email: string;
    courses: string[];
    save: () => Promise<IUser>;
}
interface IOrderData {
    courseId: string;
    userId: string;
    payment_info: any; 
}

// create order
// interface IOrderData {
//     courseId: string;
//     userId: string;
//     payment_info: any;
// }

export const createOrder = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        const { courseId, payment_info } = req.body as IOrder;

        // Validate payment
        if (payment_info?.id) {
            const paymentIntent = await stripe.paymentIntents.retrieve(payment_info.id);
            if (paymentIntent.status !== "succeeded") {
                return next(new ErrorHandler("Payment not authorized!", 400));
            }
        }

        // Fetch user
        const user = await userModel.findById(req.user?._id);
        if (!user) return next(new ErrorHandler("User not found", 404));

        // Check if user already owns the course
        if (user.courses.some((course: any) => course.toString() === courseId)) {
            return next(new ErrorHandler("You have already purchased this course", 400));
        }

        // Fetch course
        const course = await CourseModel.findById(courseId);
        if (!course) return next(new ErrorHandler("Course not found", 404));

        // Send confirmation email
        const mailData = {
            order: {
                _id: course._id.toString().slice(0, 6),
                name: course.name,
                price: course.price,
                date: new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                }),
            },
        };
        const html = await ejs.renderFile(
            path.join(__dirname, "../mails/order-confirmation.ejs"),
            { order: mailData }
        );
        await sendMail({
            email: user.email,
            subject: "Order Confirmation",
            template: "order-confirmation.ejs",
            data: mailData,
            html,
        });

        // Update user and course
        user.courses.push(course._id);
        await redis.set(user._id.toString(), JSON.stringify(user));
        await user.save();

        await NotificationModel.create({
            user: user._id,
            title: "New Order",
            message: `You have a new order from ${course.name}`,
        });

        course.purchased += 1;
        await course.save();

        // Create the order
        const orderData: IOrderData = {
            courseId: course._id.toString(),
            userId: user._id.toString(),
            payment_info,
        };
        await newOrder(orderData, res, next);
    }
);



// get all orders --- only for admin
export const getAllOrders = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        // Example usage of req
        console.log(req.user); // Log the user or any relevant info
        try {
            getAllOrdersService(res);
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
);

// sent stripe publishie key
export const sendStripePublshableKey = CatchAsyncError(
    async (req: Request, res: Response) => {
        res.status(200).json({
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        });
    }
);

//ney payment
export const newPayment = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        // Example usage of req
        console.log(req.body); // Log the request body
        try {
            const myPayment = await stripe.paymentIntents.create({
                amount: req.body.amount,
                currency: "USD",
                metadata: {
                    company: "E-Learning",
                },
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            res.status(200).json({
                success: true,
                client_secret: myPayment.client_secret,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);
