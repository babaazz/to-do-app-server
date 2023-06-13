import express from "express";
import {
  login,
  logout,
  handleRefresh,
  register,
} from "../controllers/authController.js";

import { verifyJWT } from "../middlewares/verifyJWT.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", verifyJWT, logout);
router.post("/refresh", handleRefresh);
router.post("/register", register);

export default router;
