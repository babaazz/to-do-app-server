import express from "express";
import {
  addToDo,
  getAllToDos,
  removeToDo,
} from "../controllers/todoController.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";

const router = express.Router();

router.get("/", verifyJWT, getAllToDos);
router.post("/add", verifyJWT, addToDo);
router.delete("/remove/:id", verifyJWT, removeToDo);

export default router;
