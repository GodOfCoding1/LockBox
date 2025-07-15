import express, { urlencoded, json } from "express";
import mongoose from "mongoose";
import session from "express-session";
import * as dotenv from "dotenv";
import router from "./api/index.js";
import websocket from "./websocket.js";
import * as cloudinary from "cloudinary";
dotenv.config();
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_ACCESS_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_ACCESS_KEY,
  secure: true,
});
import passport from "passport";
import passportConfig from "./passport/config.js";
import path from "path";
import morgan from "morgan";

const app = express();
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);
app.use(express.static("build"));

//Set Up the Assets Folder
// app.use(join(__dirname, "public"));
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);
// Passport Config
app.use(passport.initialize());
// init passport on every route call.
app.use(passport.session());
passportConfig(passport);

// DB Config
const db = process.env.MONGO_URI;

// Connect to MongoDB
if (db) {
  mongoose
    .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));
} else {
  throw new Error("No DB url provided");
}

// Express body parser
app.use(urlencoded({ extended: true }));
app.use(json());
// Express session

// // Passport middleware
// app.use(initialize());
// app.use(_session());

// Routes
app.get("*", (req, res, next) => {
  if (req.path.includes("api")) return next();
  res.sendFile(path.join(process.cwd(), "build", "index.html"));
});

app.use("/api", router);

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, console.log(`Server started on port ${PORT}`));

websocket(server);
