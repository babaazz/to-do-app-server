import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";

//Configuration
dotenv.config();

//Server and DB connection
const PORT = process.env.PORT || 6000;
mongoose
  .connect(process.env.LOCAL_DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connected");
    app.listen(PORT, () => {
      console.log(`Listening at port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`${err.message} couldn't connect`);
  });
