import "dotenv/config";
import * as Sentry from "@sentry/node";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import configureAuthStrategy from "./lib/configure-auth-strategy";
import passport from "passport";
import bodyParser from "body-parser";

import createRoutes from "./routes";
import "./cron";

if (process.env.NODE_ENV !== "development") {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV
  });
}

const app = express();

app.options(
  "*",
  cors({
    origin: "*"
  })
);

app.use(cors());
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json({ limit: "50mb" }));
// app.use(bodyParser.raw({ type: "*/*" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 100000
  })
);

configureAuthStrategy(passport);
createRoutes(app);

const PORT = process.env.PORT || 3001;

// mongoose connection
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  reconnectTries: 60
});

mongoose.connection.on("connected", () => {
  console.info("Connection with mongo ok");
});

app.listen(PORT, () => {
  console.info(`Server in running on port ${PORT}`);
});

module.exports = app;
