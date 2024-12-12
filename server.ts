import { app } from "./app";
import * as dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { initSocketServer } from "./socketServer";
import http from "http";
import connectDB from './utils/DB'
dotenv.config();
const server = http.createServer(app);
const PORT = process.env.PORT || 10000;
initSocketServer(server);

app.listen(process.env.PORT, () => {
  console.log(`SERVER IS CONNECTED TO ${process.env.PORT}`);
  connectDB()
});
// cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET_KEY,
});

// app.get("/debug-sentry", function mainHandler(req, res) {
//   throw new Error("My first Sentry error!");
// });