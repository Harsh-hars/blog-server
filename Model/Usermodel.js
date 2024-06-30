import mongoose from "mongoose"
const {Schema, model} = mongoose;
const userschema = Schema({
    // email: {type:String, unique:true},
    // password : String,
    email: {type: String, required: true, min: 4, unique: true},
    password: {type: String, required: true},
})
const usermodel = model('usermodel', userschema)

export default usermodel;