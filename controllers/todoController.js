import mongoose from "mongoose";
import ToDo from "../models/ToDo.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

//Add To Do
export const addToDo = catchAsync(async (req, res) => {
  const { description, priority } = req.body;
  if (!description || !priority)
    throw new AppError("Please provide ToDo description and priority", 400);

  const authorId = req.user;

  const newToDo = await ToDo.create({
    description,
    priority,
    author: new mongoose.Types.ObjectId(authorId),
    isDone: false,
  });

  res.status(201).json({
    status: "Success",
    data: {
      toDo: newToDo,
    },
  });
});

//Remove To Do
export const removeToDo = catchAsync(async (req, res) => {
  const toDoId = req.params.id;

  await ToDo.findByIdAndDelete(toDoId);
  res.sendStatus(204);
});

//Get all
export const getAllToDos = catchAsync(async (req, res) => {
  const userId = req.user;
  const toDoList = await ToDo.find({ author: userId });

  res.status(200).json({
    status: "Success",
    data: {
      toDoList,
    },
  });
});
