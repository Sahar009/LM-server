import { app } from "./app";
import * as dotenv from "dotenv";

dotenv.config();


app.listen(process.env.PORT, () => {
  console.log(`SERVER IS CONNECTED TO ${process.env.PORT}`);
});

// app.get("/debug-sentry", function mainHandler(req, res) {
//   throw new Error("My first Sentry error!");
// });