import { NextFunction, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import OrderModel, { IOrder } from "../models/order.model";

// create new order
interface IOrderData {
    courseId: string;
    userId: string;
    payment_info: any;
}

export const newOrder = CatchAsyncError(async (data: IOrder) => {
    return await OrderModel.create(data);
  })
  


// Get all orders 
export const getAllOrdersService = async (res: Response) => {
    return await OrderModel.find().sort({ createdAt: -1 });
}