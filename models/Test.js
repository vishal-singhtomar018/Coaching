const mongoose=require('mongoose');
const schema=new mongoose.Schema({tutor:{type:mongoose.Schema.Types.ObjectId,ref:'TutorEnrollment',required:true},student:{type:mongoose.Schema.Types.ObjectId,ref:'StudentEnrollment',required:true},title:{type:String,required:true},description:String,testDate:Date,maxMarks:{type:Number,default:100},marks:Number,feedback:String,status:{type:String,enum:['scheduled','completed'],default:'scheduled'}},{timestamps:true});
module.exports=mongoose.model('Test',schema);
