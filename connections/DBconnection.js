import mongoose from "mongoose";

export const connectDB = async(url)=>{
    return mongoose.connect(url);
}