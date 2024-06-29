import mongoose from "mongoose";

export const connectDB = (uri: string) => {
  mongoose
    .connect(uri, {
      dbName: "E Commerce",
    })
    .then(() => console.log(`Database connected successfully`))
    .catch((error) => console.log(error));
};
