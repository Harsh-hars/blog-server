import mongoose from "mongoose";

const mongo_uri = "mongodb+srv://harsh:harsh_2003@cluster0.nn0osfr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

export async function db(){
    try {
      await mongoose.connect(mongo_uri) 
      console.log("database connected successfully")
    } catch (error) {
        console.log(error)
    }
}