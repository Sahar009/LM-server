require("./instrument.js");
require('dotenv').config()

const Sentry = require("@sentry/node");

import express,{Request,Response,NextFunction,Errback} from "express";

export const app = express()
import cors from 'cors'
import cookieParser from "cookie-parser"
import { ErrorMiddleware } from "./middleware/error";


// body parser
app.use(express.json({limit:"50mb"}))

// cookieparser
app.use(cookieParser())
// cors

app.use(cors({origin:process.env.ORIGIN}))

app.get('/test',(req:Request,res:Response,next:NextFunction) =>{
res.status(200).json({
    success:true,
    message:"Api de function well"
})
})

app.all("*",(req:Request,res:Response,next:NextFunction)=>{
    const err = new Error(`Route ${req.originalUrl} not found`) as any;
    err.statusCode = 404;
    next(err)
})






Sentry.setupExpressErrorHandler(app);

app.use(function onError(err:Errback, req:Request, res:Response, next:NextFunction) {
    // The error id is attached to `res.sentry` to be returned
    // and optionally displayed to the user for support.
    res.statusCode = 500;
    // res.end(res.sentry + "\n");
  });


  app.use(ErrorMiddleware);