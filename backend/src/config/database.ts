import mongoose from "mongoose";

export const connectDB = (uri: string) => {
  mongoose
    .connect(uri, {
      dbName: "E_Commerce",
    })
    .then(() => console.log(`Database connected successfully`))
    .catch((error) => console.log(error));
};
