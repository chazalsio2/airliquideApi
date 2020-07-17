import "dotenv/config";
import * as Sentry from "@sentry/node";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import createRoutes from "./routes";

if (process.env.NODE_ENV !== "development") {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
  });
}

const app = express();

app.options(
  "*",
  cors({
    origin: "*",
  })
);

app.use(cors());

createRoutes(app);

const PORT = process.env.PORT || 3001;

// mongoose connection
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  // useUnifiedTopology: true // Error Server selection timed out after 30000 ms if activated
});

mongoose.connection.on("connected", () => {
  console.log("Connection with mongo ok");
});

app.listen(PORT, () => {
  console.log(`Server in running on port ${PORT}`);
});

module.exports = app;
