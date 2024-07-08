require("./instrument.js");


const Sentry = require("@sentry/node");
import * as  express from "express";
export const app = express()


Sentry.setupExpressErrorHandler(app);

app.use(function onError(err, req, res, next) {
    // The error id is attached to `res.sentry` to be returned
    // and optionally displayed to the user for support.
    res.statusCode = 500;
    res.end(res.sentry + "\n");
  });