import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

//Register User

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, picturePath } = req.body;

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      picturePath,
      toDoList: [],
    });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Login

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });

    if (!user) return res.status(400).json({ message: "User doesn't exist" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid Credentials" });

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

    user.refreshToken = refreshToken;
    await user.save();

    user.password = undefined;

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ accessToken, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Logout

export const logout = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });

    if (!user) return res.status(404).json({ message: "User doesn't exist" });

    user.refreshToken = undefined;
    await user.save();
    res.status(201).json({ message: "User Logged Out" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
