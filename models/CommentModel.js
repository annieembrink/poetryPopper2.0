// DONE: Create Quote Model Schema
import mongoose from "mongoose";
import dotenv from "dotenv";
import { exit } from "process";

// read from .env file and add to process.env
dotenv.config();

// exit program if no connection string
if (!process.env.MONGO_CONNECTION_STR) {
  console.error("MONGO_CONNECTION_STR is not defined in .env file");
  exit();
}

// connect to database
const uri = process.env.MONGO_CONNECTION_STR;
mongoose.connect(uri);

const commentSchema = new mongoose.Schema(
  {
  comment: {
    type: String,
    required: "must be filled in",
  },
  poemId: {
    type: String,
  },
  postedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
},
{timestamps: true} 
);

const CommentModel = mongoose.model("Comment", commentSchema);

export default CommentModel;