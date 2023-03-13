import express from "express";
import handleRefresh from "../controllers/refreshTokenController.js";

const router = express.Router();

router.get("/", handleRefresh);

export default router;
