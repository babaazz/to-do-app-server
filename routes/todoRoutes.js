import express from "express";
import {
  addToDo,
  getAllToDos,
  removeToDo,
} from "../controllers/todoController.js";

const router = express.Router();

router.get("/:userId/allToDos", getAllToDos);
router.post("/addToDo", addToDo);
router.delete("/removeToDo", removeToDo);

export default router;
