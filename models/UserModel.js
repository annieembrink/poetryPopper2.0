import mongoose from "mongoose";
import dotenv from "dotenv";
import {
  exit
} from "process";
import bcrypt from "bcrypt";

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

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: "username must be filled in",
    lowercase: true,
    unique: true,
    match: [/^[a-zA-Z0-9]+$/, "is invalid"],
  },
  password: {
    type: String,
    required: "password must be filled in",
    minLength: 4,
    maxLength: 36,
  },
}, {
  timestamps: true
});

// Make sure password is hashed before saving
userSchema.pre("save", function (next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }

    // hash password
    this.password = bcrypt.hashSync(this.password, 10);

    // after hashing continue with save()
    next();
  } catch (err) {
    throw new Error("Inccorect password", err);
  }
});

// userSchema.pre('findOneAndUpdate', function (next) {
//   this.options.runValidators = true
//   next()
// })

// userSchema.pre('findOneAndUpdate', function (next) {
//   console.log(this.password)
//   try {
//     if (!this.isModified("password")) {
//       return next();
//     }

//     // hash password
//     this.password = bcrypt.hashSync(this.password, 10);

//     // after hashing continue with save()
//     next();
//   } catch (err) {
//     throw new Error("Inccorect password", err);
//   }
// })

// userSchema.pre('find', function() {
//   console.log('pre', this.password)
// });

// userSchema.post('find', function(result) {
//   console.log('post', this.password)
// });

userSchema.pre('findOneAndUpdate', async function() {
  const docToUpdate = await this.model.findOne(this.getQuery());
  console.log('docToUpdate', docToUpdate); // The document that `findOneAndUpdate()` will modify

});
userSchema.post('findOneAndUpdate', async function() {
  const docToUpdate = await this.model.findOne(this.getQuery());
  console.log('docToUpdatePOSt', docToUpdate); // The document that `findOneAndUpdate()` will modify

});


const UserModel = mongoose.model("User", userSchema);

export default UserModel;