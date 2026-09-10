const express=require('express');const router=express.Router();const c=require('../controllers/studentController');const {isLoggedIn}=require('../middleware/authMiddleware');const {isStudent}=require('../middleware/studentMiddleware');
router.use(isLoggedIn,isStudent);
router.get('/dashboard',c.dashboard);router.get('/profile',c.profile);router.post('/profile',c.updateProfile);router.post('/change-password',c.changePassword);router.post('/request-tutor-change',c.requestTutorChange);
router.get('/assignments',c.assignments);router.post('/assignments/:id/submit',c.submitAssignment);
router.get('/attendance',c.attendance);router.get('/materials',c.materials);router.get('/tests',c.tests);router.get('/schedule',c.schedule);router.get('/progress',c.progress);router.get('/notifications',c.notifications);router.get('/messages',c.messages);router.post('/messages',c.sendMessage);
module.exports=router;
