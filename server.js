import "dotenv/config";
import * as Sentry from "@sentry/node";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import configureAuthStrategy from "./lib/configure-auth-strategy";
import passport from "passport";
import bodyParser from "body-parser";
const  http =  require("http");
const {Server} = require("socket.io");

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

const server = http.createServer(app)
const io = new Server(server,{
  cors:{
    origin: "http://localhost:3000",
    methods:["GET","POST"]
  }
})

io.on("connection", (socket) => {                                                                               
  console.log("New connection");

  console.log(`user connected : ${socket.id}`);

  socket.on("join_room",(data) => {
    socket.join (data)
    console.log(`user with ID:${socket.id} joined room:${data}`);
  })

  socket.on("send_message",(data) => {
    socket.to(data.room).emit("receive_message",data)
  })
                                                                                
  socket.on("disconnect",()=>{
    console.log("User disconnected", socket.id );
  })
})

server.listen(PORT, () => {
  console.info(`Server in running on port ${PORT}`);
});

module.exports = app;
