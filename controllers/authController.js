import jwt from "jsonwebtoken";
import User from "../models/User.js";

//Register User

export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      picturePath,
    } = req.body;

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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Login

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Please provide Email and password" });

    const user = await User.findOne({ email: email }).select("+password");

    if (!user || !(await user.isPasswordMatched(password, user.password)))
      return res.status(400).json({ message: "Email or Password incorrect" });

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
    res.status(200).json({ accessToken, user: loggedInUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Logout

export const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user);

    if (!user) return res.status(404).json({ message: "User doesn't exist" });

    const updatedUser = await User.findOneAndUpdate(
      { email: user.email },
      {
        $set: { refreshToken: "lol" },
      },
      { new: true }
    );
    res.status(200).json({ message: "User Logged Out", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleRefresh = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt)
      return res.status(401).json({ message: "Not Authorised" });
    console.log(cookies.jwt);
    const refreshToken = cookies.jwt;
    const foundUser = await User.findOne({ refreshToken: refreshToken });
    if (!foundUser) return res.status(403).json({ message: "Forbidden" });

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        const foundUserId = foundUser._id.valueOf();
        if (err || foundUserId !== decoded.id)
          return res.status(403).json({ message: "forbidden" });

        const accessToken = jwt.sign(
          { id: foundUser._id },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "700s" }
        );
        res.status(201).json({ accessToken });
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
