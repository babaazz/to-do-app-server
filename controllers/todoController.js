import mongoose from "mongoose";
import User from "../models/User.js";
import ToDo from "../models/ToDo.js";

//Add To Do
export const addToDo = async (req, res) => {
  try {
    const { authorId, description, priority } = req.body;
    const toDoToAdd = new ToDo({
      _id: new mongoose.Types.ObjectId(),
      description,
      priority,
      author: new mongoose.Types.ObjectId(authorId),
      isDone: false,
    });
    const author = await User.findOne({ _id: authorId });
    const newTodoList = author.toDoList.push(toDoToAdd._id);
    await author.save();
    await toDoToAdd.save();
    res.status(201).json(newTodoList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Remove To Do
export const removeToDo = async (req, res) => {
  try {
    const { toDoId } = req.body;
    const objId = new mongoose.Types.ObjectId(toDoId);
    const toDoToRemove = await ToDo.deleteOne({ _id: objId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Get all
export const getAllToDos = async (req, res) => {
  try {
    const { userId } = req.params;
    const objId = new mongoose.Types.ObjectId(userId);
    const popUser = await User.findOne({ _id: objId }).populate("toDoList");
    const toDoList = popUser.toDoList;
    res.status(200).json(toDoList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
