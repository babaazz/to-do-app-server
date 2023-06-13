import jwt from "jsonwebtoken";
import { promisify } from "util";
import User from "../models/User.js";

export const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    console.log(authHeader);
    if (!authHeader?.startsWith("Bearer "))
      return res.status(403).send("Access Denied");

    const accessToken = authHeader.split(" ")[1];
    console.log(accessToken);

    const decoded = await promisify(jwt.verify)(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      throw new Error("The user no longer exist");
    }

    if (currentUser.hasPasswordChangedAfterLastLogin(decoded.iat)) {
      throw new Error("Passowrd has been changed after last login");
    }

    req.user = currentUser;

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
