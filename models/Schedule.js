const mongoose=require('mongoose');
const schema=new mongoose.Schema({tutor:{type:mongoose.Schema.Types.ObjectId,ref:'TutorEnrollment',required:true},student:{type:mongoose.Schema.Types.ObjectId,ref:'StudentEnrollment',required:true},day:String,startTime:String,endTime:String,subject:String,location:String,notes:String},{timestamps:true});
module.exports=mongoose.model('Schedule',schema);
