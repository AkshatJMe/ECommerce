import mongoose, { Document, Schema } from "mongoose";
import validator from "validator";

// Define the IUser interface extending Mongoose's Document
interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  photo: string;
  role: "admin" | "user"; // User's role can either be "admin" or "user"
  gender: "male" | "female"; // User's gender can either be "male" or "female"
  dob: Date; // Date of birth
  createdAt: Date; // Timestamp when the document was created
  updatedAt: Date; // Timestamp when the document was last updated
  age: number; // Virtual attribute to calculate age
}

// Define a Mongoose schema for the User model
const userSchema = new Schema(
  {
    // Unique identifier for the user
    _id: {
      type: String, // Specifies that '_id' is of type String
      required: [true, "Please enter ID"], // Ensures '_id' is required with a custom error message
    },

    // User's name
    name: {
      type: String, // Specifies that 'name' is of type String
      required: [true, "Please enter Name"], // Ensures 'name' is required with a custom error message
    },

    // User's email address
    email: {
      type: String, // Specifies that 'email' is of type String
      unique: [true, "Email already exists"], // Ensures 'email' is unique with a custom error message
      required: [true, "Please enter Email"], // Ensures 'email' is required with a custom error message
      validate: [validator.isEmail, "Please enter a valid Email"], // Validates that 'email' is in a proper email format
    },

    // User's photo URL
    photo: {
      type: String, // Specifies that 'photo' is of type String
      required: [true, "Please add Photo"], // Ensures 'photo' is required with a custom error message
    },

    // User's role in the application
    role: {
      type: String, // Specifies that 'role' is of type String
      enum: ["admin", "user"], // Restricts 'role' to either "admin" or "user"
      default: "user", // Sets default value for 'role'
    },

    // User's gender
    gender: {
      type: String, // Specifies that 'gender' is of type String
      enum: ["male", "female"], // Restricts 'gender' to either "male" or "female"
      required: [true, "Please enter Gender"], // Ensures 'gender' is required with a custom error message
    },

    // User's date of birth
    dob: {
      type: Date, // Specifies that 'dob' is of type Date
      required: [true, "Please enter Date of birth"], // Ensures 'dob' is required with a custom error message
    },
  },
  {
    timestamps: true, // Automatically adds 'createdAt' and 'updatedAt' fields to the schema
  }
);

// Virtual attribute to calculate the user's age based on their date of birth
userSchema.virtual("age").get(function (this: IUser) {
  const today = new Date(); // Get today's date
  const dob = this.dob; // Get the user's date of birth
  let age = today.getFullYear() - dob.getFullYear(); // Calculate initial age

  // Adjust age if the current date is before the birthday in the current year
  if (
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
  ) {
    age--;
  }

  return age; // Return the calculated age
});

// Create and export a Mongoose model named 'User' using the defined schema and IUser interface
export const User = mongoose.model<IUser>("User", userSchema);
