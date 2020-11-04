require("dotenv").config();
require("./config/passport");
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import "reflect-metadata";
import { createConnection } from "typeorm";
import { config } from "./config/ormconfig";

// Routes
import router from "./routes";

// Middlewares
import { errorHandler } from "./helper/error-handler";
import passport from "passport";

createConnection(config).then((connection) => {
  const app = express();

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(
    cors({
      origin: "http://localhost:3000", // allow to server to accept request from different origin
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true, // allow session cookie from browser to pass through
    })
  );

  app.use(passport.initialize());

  app.use("/", router);

  app.use(errorHandler);

  const port = process.env.NODE_ENV === "production" ? 80 : 5000;
  app.listen(port, () => {
    console.log(`Server listening on ${port}`);
  });
});
