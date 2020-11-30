require("./config/passport");
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import "reflect-metadata";
import session from "express-session";
import pg from "pg";
const pgSession = require("connect-pg-simple")(session);
import passport from "passport";
import connection from "./connection";
import {
  SESSION_SECRET,
  SESSION_MAX_AGE,
  POSTGRES_DB_URL,
  PORT,
} from "./config/secrets";

// Routes
import router from "./routes";

// Middlewares
import { errorHandler } from "./helper/error-handler";

const app = express();

connection
  .create()
  .then(() => {
    console.log(`Connected to the database`);
  })
  .catch((err) => {
    console.log(err);
  });

app.set("port", PORT);

app.disable("x-powered-by");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:3000", // allow to server to accept request from different origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // allow session cookie from browser to pass through
  })
);

const pgPool = new pg.Pool({
  connectionString: POSTGRES_DB_URL,
});

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: "session.id",
    cookie: {
      maxAge: parseInt(SESSION_MAX_AGE) * 1000,
      secure: false,
    },
    store: new pgSession({
      pool: pgPool,
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/", router);

app.use(errorHandler);

export default app;
