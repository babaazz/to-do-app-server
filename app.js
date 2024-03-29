import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import morgan from "morgan";
import multer from "multer";
import { logger } from "./middlewares/logEvents.js";
import { register } from "./controllers/authController.js";
import authRoutes from "./routes/authRoutes.js";
import toDosRoutes from "./routes/todoRoutes.js";
import globalErrorHandler from "./middlewares/globalErrorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//App config
const app = express();
app.use(logger);
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

//File Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

//Routes with file upload
app.post("/auth/register", upload.single("picture"), register);

//Routes
app.use("/auth", authRoutes);
app.use("/todos", toDosRoutes);

//Global Error Handler
app.use(globalErrorHandler);

export default app;
