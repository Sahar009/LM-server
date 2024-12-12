require("./instrument.js");
require('dotenv').config()


import express,{Request,Response,NextFunction} from "express";

export const app = express()
import cors from 'cors'
import cookieParser from "cookie-parser"
import { ErrorMidleware } from "./middleware/error";
import userRouter from "./routes/user.route";
import ErrorHandler from "./utils/ErrorHandler";
import { rateLimit } from "express-rate-limit";
import courseRouter from "./routes/course.route";
import orderRouter from "./routes/order.route";
import notificationRoute from "./routes/notification.route";
import analyticsRouter from "./routes/analytics.route";
import layoutRouter from "./routes/layout.route";


// body parser
app.use(express.json({limit:"50mb"}))
app.use(express.urlencoded({extended:false}))

// cookieparser
app.use(cookieParser())
// cors
// const allowedOrigins = [process.env.ORIGIN];  
// app.use(cors({ origin: allowedOrigins }));
app.use(cors())
// {origin:'http://localhost:3000'}
// process.env.ORIGIN

// api request limit
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  });

app.use((err: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
  console.log(req.body);
    err.statusCode = err.statusCode || 500;
    res.status(err.statusCode as any).json({
        success: false,
        message: err.message,
    });
    next(err); 
});
// routes middleware

app.use("/api/v1",userRouter, courseRouter,orderRouter,notificationRoute,analyticsRouter, layoutRouter)


app.get('/test', (req: Request, res: Response, next: NextFunction) => {
  console.log(req.query); 
  res.status(200).json({
      success: true,
      message: "Api de function well"
  });
  next();
});



app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Router ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  res.status(err.statusCode).json({ message: err.message });
  next(err);
});


// midleware call
app.use(limiter);


app.use(ErrorMidleware);

// Sentry.setupExpressErrorHandler(app);

// app.use(function onError(err:Errback, req:Request, res:Response, next:NextFunction) {
//     // The error id is attached to `res.sentry` to be returned
//     // and optionally displayed to the user for support.
//     res.statusCode = 500;
//     // res.end(res.sentry + "\n");
//   });


 