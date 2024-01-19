import express, { urlencoded, json } from "express";
import expressLayouts from "express-ejs-layouts";
import mongoose from "mongoose";
import session from "express-session";
import * as dotenv from "dotenv";
import router from "./api/index.js";
dotenv.config();
const app = express();

//Set Up the Assets Folder
// app.use(join(__dirname, "public"));

// Passport Config
// require('./config/passport')(passport);

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

// EJS
app.use(expressLayouts);
app.set("view engine", "ejs");

// Express body parser
app.use(urlencoded({ extended: true }));
app.use(json());

// Express session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// // Passport middleware
// app.use(initialize());
// app.use(_session());

// Routes
app.use("/api", router);

const PORT = process.env.PORT || 8000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
