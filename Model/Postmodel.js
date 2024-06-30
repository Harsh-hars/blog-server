import mongoose from "mongoose";
const {Schema, model} = mongoose;
const postschema = Schema({
   title : String,
   summary : String,
   content : String,
   cover:String,
   author:{type:mongoose.Schema.Types.ObjectId, ref:'usermodel'},
},{
    timestamps:true,
})

 const postmodel = model('postmodel' , postschema );
 export default postmodel;