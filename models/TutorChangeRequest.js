const mongoose=require('mongoose');
const schema=new mongoose.Schema({student:{type:mongoose.Schema.Types.ObjectId,ref:'StudentEnrollment',required:true},currentTutor:{type:mongoose.Schema.Types.ObjectId,ref:'TutorEnrollment',default:null},reason:{type:String,required:true},status:{type:String,enum:['pending','approved','rejected'],default:'pending'},adminNote:String},{timestamps:true});
module.exports=mongoose.model('TutorChangeRequest',schema);
