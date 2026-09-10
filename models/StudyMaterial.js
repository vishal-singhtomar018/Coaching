const mongoose=require('mongoose');
const schema=new mongoose.Schema({tutor:{type:mongoose.Schema.Types.ObjectId,ref:'TutorEnrollment',required:true},title:{type:String,required:true},description:String,fileUrl:String,originalName:String},{timestamps:true});
module.exports=mongoose.model('StudyMaterial',schema);
