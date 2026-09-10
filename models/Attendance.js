const mongoose = require('mongoose');
const schema = new mongoose.Schema({
 tutor:{type:mongoose.Schema.Types.ObjectId,ref:'TutorEnrollment',required:true},
 student:{type:mongoose.Schema.Types.ObjectId,ref:'StudentEnrollment',required:true},
 date:{type:Date,required:true}, status:{type:String,enum:['present','absent','late'],required:true}, note:String
},{timestamps:true});
schema.index({tutor:1,student:1,date:1},{unique:true});
module.exports=mongoose.model('Attendance',schema);
