import AppError from "../utils/appError.js";
import { logEvents } from "./logEvents.js";

const handleDBCastError = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateKeyError = (err) => {
  const value = err.keyValue.name;
  const message = `Duplicate field value ${value}. Please use another`;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((error) => error.message);
  const message = `Invalid input data: \n ${errors.join(".\n")}`;
  return new AppError(message, 400);
};

const handleTokeExpiredError = (err) => {
  return new AppError("Login expired. Please Login again", 401);
};

const handleInvalidTokenError = (err) => {
  return new AppError("Invalid credentials", 401);
};

const errorSpecifier = (err) => {
  if (err.name === "CastError") return handleDBCastError(err);
  if (err.code === "11000") return handleDuplicateKeyError(err);
  if (err.name === "ValidationError") return handleValidationError(err);
  if (err.name === "JsonWebTokenError") return handleInvalidTokenError();
  if (err.name === "TokenExpiredError") return handleTokeExpiredError();
  return err;
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    name: err.name,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statuscode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: err.status,
      message: "Oops something went wrong",
    });
  }
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  const errorLogMessage = `${err.statusCode}\t${err.message}\n`;
  logEvents(errorLogMessage, "errorLog.txt");

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = Object.create(err, Object.getOwnPropertyDescriptors(err));
    error = errorSpecifier(error);
    sendErrorProd(error, res);
  }
};

export default globalErrorHandler;
