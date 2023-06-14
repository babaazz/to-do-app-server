import jwt from "jsonwebtoken";
import { promisify } from "util";
import User from "../models/User.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

export const verifyJWT = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  console.log(authHeader);
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError("Access Denied", 403);
  }

  const accessToken = authHeader.split(" ")[1];
  console.log(accessToken);

  const decoded = await promisify(jwt.verify)(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET
  );

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    throw new AppError("The user no longer exist", 403);
  }

  if (currentUser.hasPasswordChangedAfterLastLogin(decoded.iat)) {
    throw new AppError("Passowrd has been changed after last login", 403);
  }

  req.user = currentUser;

  next();
});
