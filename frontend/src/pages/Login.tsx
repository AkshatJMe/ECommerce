import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useState } from "react";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { auth } from "../firebase";
import { getUser } from "../services/userAPI";
import { useLoginMutation } from "../services/userAPI";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { userExist, userNotExist } from "../redux/reducer/userReducer";
import { useDispatch } from "react-redux";
const Login = () => {
  const dispatch = useDispatch();
  const [gender, setGender] = useState("");
  const [date, setDate] = useState("");

  const [login] = useLoginMutation();

  const loginHandler = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);

      console.log({
        name: user.displayName!,
        email: user.email!,
        photo: user.photoURL!,
        gender,
        role: "user",
        dob: date,
        _id: user.uid,
      });

      const res = await login({
        name: user.displayName!,
        email: user.email!,
        photo: user.photoURL!,
        gender,
        role: "user",
        dob: date,
        _id: user.uid,
      });

      if ("data" in res) {
        toast.success(res.data.message);
        const data = await getUser(user.uid);
        dispatch(userExist(data?.user!));
      } else {
        const error = res.error as FetchBaseQueryError;
        const message = (error.data as { message: string }).message;
        toast.error(message);
        dispatch(userNotExist());
      }
    } catch (error) {
      toast.error("Sign In Failed");
    }
  };

  return (
    <div className="login min-h-screen flex items-center justify-center bg-gray-100">
      <main className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-teal-600">Login</h1>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of birth
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center justify-center space-x-3">
          <p className="text-sm text-gray-600">Already Signed In Once</p>
          <button
            onClick={loginHandler}
            className="flex items-center w-fit bg-teal-500 text-white font-semibold rounded-lg shadow-md transition-colors hover:bg-teal-600"
          >
            <FcGoogle className="mr-2 text-lg" />
            <span>Sign in with Google</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Login;
