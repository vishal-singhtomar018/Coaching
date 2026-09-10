const mongoose=require('mongoose');
const schema=new mongoose.Schema({tutor:{type:mongoose.Schema.Types.ObjectId,ref:'TutorEnrollment',required:true},student:{type:mongoose.Schema.Types.ObjectId,ref:'StudentEnrollment',required:true},topic:String,score:{type:Number,min:0,max:100},remark:String},{timestamps:true});
module.exports=mongoose.model('Progress',schema);
