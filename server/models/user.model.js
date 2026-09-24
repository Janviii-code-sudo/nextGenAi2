// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//   name:{
//     type:String,
//     required:true,
//   },
//   email:{
//     type:String,
//     unique:true,
//     require:true,
//   },
//   credits:{
//     type:Number,
//     default:100,
//   }

// }, {timestamp:true})

// const User = mongoose.model("User", userSchema)

// export default User;
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      unique: true,
      required: true
    },

    credits: {
      type: Number,
      default: 100
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model("User", userSchema);

export default User;