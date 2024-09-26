require("./instrument.js");
require('dotenv').config()

const Sentry = require("@sentry/node");

import express,{Request,Response,NextFunction,Errback} from "express";

export const app = express()
import cors from 'cors'
import cookieParser from "cookie-parser"
import { ErrorMidleware } from "./middleware/error";
import userRouter from "./routes/user.route";
import ErrorHandler from "./utils/ErrorHandler";
import { rateLimit } from "express-rate-limit";
import courseRouter from "./routes/course.route";


// body parser
app.use(express.json({limit:"50mb"}))
app.use(express.urlencoded({extended:false}))

// cookieparser
app.use(cookieParser())
// cors

app.use(cors({origin:process.env.ORIGIN}))
app.use((err: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    res.status(err.statusCode as any).json({
        success: false,
        message: err.message,
    });
});
// routes middleware

app.use("/api/v1",userRouter, courseRouter,)


app.get('/test',(req:Request,res:Response,next:NextFunction) =>{
res.status(200).json({
    success:true,
    message:"Api de function well"
})
})



app.all("*", (req: Request, res: Response, next: NextFunction) => {
    const err = new Error(`Router ${req.originalUrl} not found`) as any;
    err.statusCode = 404;
    next(err);
  });
  



app.use(ErrorMidleware);

// Sentry.setupExpressErrorHandler(app);

// app.use(function onError(err:Errback, req:Request, res:Response, next:NextFunction) {
//     // The error id is attached to `res.sentry` to be returned
//     // and optionally displayed to the user for support.
//     res.statusCode = 500;
//     // res.end(res.sentry + "\n");
//   });


 