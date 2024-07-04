import multer from "multer";

// Create a multer instance to handle single file uploads
// 'photo' is the name of the field in the form
export const singleUpload = multer().single("photo");

// Create a multer instance to handle multiple file uploads
// 'photos' is the name of the field in the form
// The second parameter (5) specifies the maximum number of files that can be uploaded
export const mutliUpload = multer().array("photos", 5);
