import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

//Register User

export const register = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, confirmPassword, picturePath } =
    req.body;

  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    picturePath,
    toDoList: [],
  });

  newUser.password = undefined;

  res.status(201).json(newUser);
});

//Login

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError("Please provide valid email and password", 400);
  }

  const user = await User.findOne({ email: email }).select("+password");

  if (!user || !(await user.isPasswordMatched(password, user.password))) {
    throw new AppError("Email or password incorrect", 403);
  }

  const accessToken = jwt.sign(
    {
      id: user._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "700s" }
  );
  const refreshToken = jwt.sign(
    {
      id: user._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  const loggedInUser = await User.findOneAndUpdate(
    { email: email },
    { $set: { refreshToken: refreshToken } },
    { new: true }
  );

  user.password = undefined;

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.status(200).json({
    status: "Success",
    accessToken,
    user: loggedInUser,
  });
});

//Logout

export const logout = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user);

  if (!user) throw new AppError("User doesn't exist", 400);

  const updatedUser = await User.findOneAndUpdate(
    { email: user.email },
    {
      $set: { refreshToken: "" },
    },
    { new: true }
  );
  res.status(200).json({
    status: "Success",
    message: "User logged out",
  });
});

export const handleRefresh = catchAsync(async (req, res, next) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    throw new AppError("Not Authorised", 401);
  }

  const refreshToken = cookies.jwt;
  const foundUser = await User.findOne({ refreshToken: refreshToken });
  if (!foundUser) {
    throw new AppError("Not Authorised", 401);
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    const foundUserId = foundUser._id.valueOf();
    if (err || foundUserId !== decoded.id) {
      throw new AppError("Forbidden", 403);
    }

    const accessToken = jwt.sign(
      { id: foundUser._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "700s" }
    );
    res.status(201).json({
      status: "Success",
      accessToken,
    });
  });
});
