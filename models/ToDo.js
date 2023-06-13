import mongoose from "mongoose";

const ToDosSchema = mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    isDone: {
      type: Boolean,
      required: true,
    },
    priority: {
      type: String,
      enum: ["red", "yellow", "green"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { tinestamps: true }
);

const ToDo = mongoose.model("ToDo", ToDosSchema);
export default ToDo;
