const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  tutor:{type:mongoose.Schema.Types.ObjectId,ref:'TutorEnrollment',required:true},
  student:{type:mongoose.Schema.Types.ObjectId,ref:'StudentEnrollment',required:true},
  title:{type:String,required:true}, description:String, dueDate:Date,
  status:{type:String,enum:['pending','submitted','completed'],default:'pending'},
  submission:String, submittedAt:Date
},{timestamps:true});
module.exports=mongoose.model('Assignment',schema);
