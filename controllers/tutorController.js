
const bcrypt = require('bcryptjs');

const Tutor = require('../models/TutorEnrollment');
const Student = require('../models/StudentEnrollment');
const Assignment = require('../models/Assignment');
const Attendance = require('../models/Attendance');
const StudyMaterial = require('../models/StudyMaterial');
const Test = require('../models/Test');
const Schedule = require('../models/Schedule');
const Notification = require('../models/Notification');
const Message = require('../models/Message');
const Progress = require('../models/Progress');
const User = require('../models/User');


/* =========================================================
   GET LOGGED-IN TUTOR
========================================================= */

async function getTutor(req) {
    return Tutor.findOne({
        user: req.session.user.id,
        isDeleted: { $ne: true }
    });
}


/* =========================================================
   SEND NOTIFICATION TO STUDENT
========================================================= */

async function notify(student, title, message) {
    const s = await Student.findById(student);

    if (s?.user) {
        await Notification.create({
            user: s.user,
            title,
            message
        });
    }
}


/* =========================================================
   TUTOR DASHBOARD
========================================================= */

exports.dashboard = async (req, res) => {
    try {
        const tutor = await getTutor(req);

        if (!tutor) {
            return res.redirect('/');
        }

        const students = await Student.find({
            assignedTutor: tutor._id,
            isDeleted: { $ne: true }
        });

        const [
            assignments,
            attendance,
            materials,
            tests,
            schedules,
            progress,
            notifications
        ] = await Promise.all([
            Assignment.find({
                tutor: tutor._id
            }).sort({ createdAt: -1 }),

            Attendance.find({
                tutor: tutor._id
            }).sort({ date: -1 }),

            StudyMaterial.find({
                tutor: tutor._id
            }).sort({ createdAt: -1 }),

            Test.find({
                tutor: tutor._id
            }).sort({ testDate: 1 }),

            Schedule.find({
                tutor: tutor._id
            }).sort({ createdAt: -1 }),

            Progress.find({
                tutor: tutor._id
            }).sort({ createdAt: -1 }),

            Notification.find({
                user: req.session.user.id,
                read: false
            })
        ]);

        res.render('dashboard/tutor-dashboard', {
            title: 'Tutor Dashboard',
            tutor,
            students,
            assignments,
            attendance,
            materials,
            tests,
            schedules,
            progress,
            notifications,
            user: req.session.user
        });

    } catch (e) {
        console.log(e);
        res.status(500).send('Server Error');
    }
};


/* =========================================================
   STUDENT PROFILE
========================================================= */

exports.studentProfile = async (req, res) => {
    try {
        const tutor = await getTutor(req);

        const student = await Student.findOne({
            _id: req.params.id,
            assignedTutor: tutor._id,
            isDeleted: { $ne: true }
        }).populate('assignedTutor');

        if (!student) {
            return res.status(404).send('Student not found');
        }

        const [
            attendanceSheets,
            assignments,
            tests,
            progress
        ] = await Promise.all([
            Attendance.find({
                $or: [
                    { 'students.student': student._id },
                    { student: student._id }
                ]
            }).sort({ date: -1 }),

            Assignment.find({
                student: student._id,
                tutor: tutor._id
            }),

            Test.find({
                student: student._id,
                tutor: tutor._id
            }),

            Progress.find({
                student: student._id,
                tutor: tutor._id
            })
        ]);

        const attendance = attendanceSheets.map(sheet => {

            if (Array.isArray(sheet.students)) {

                const item = sheet.students.find(
                    s =>
                        String(s.student) ===
                        String(student._id)
                );

                return {
                    date: sheet.date,
                    status: item?.status || '—',
                    note: item?.note || ''
                };
            }

            return {
                date: sheet.date,
                status: sheet.status || '—',
                note: sheet.note || ''
            };
        });

        res.render('tutor/student-profile', {
            title: 'Student Profile',
            tutor,
            student,
            attendance,
            assignments,
            tests,
            progress,
            user: req.session.user
        });

    } catch (e) {
        console.log(e);
        res.status(500).send('Server Error');
    }
};


/* =========================================================
   MY STUDENTS
========================================================= */

exports.students = async (req, res) => {

    const tutor = await getTutor(req);

    const students = await Student.find({
        assignedTutor: tutor._id,
        isDeleted: { $ne: true }
    });

    res.render('dashboard/tutor-students', {
        title: 'My Students',
        tutor,
        students,
        user: req.session.user
    });
};


/* =========================================================
   ATTENDANCE DATE HELPER
========================================================= */

function attendanceDate(value) {

    const match = String(value || '').match(
        /^(\d{4})-(\d{2})-(\d{2})$/
    );

    if (!match) {
        return null;
    }

    const date = new Date(
        Date.UTC(
            Number(match[1]),
            Number(match[2]) - 1,
            Number(match[3])
        )
    );

    return Number.isNaN(date.getTime())
        ? null
        : date;
}


/* =========================================================
   FORMAT DATE FOR USER
========================================================= */

function userDate(value) {

    return String(
        value ||
        new Date().toISOString().slice(0, 10)
    ).slice(0, 10);
}


/* =========================================================
   SHOW ATTENDANCE SHEET
========================================================= */

exports.attendance = async (req, res) => {

    try {

        const tutor = await getTutor(req);

        if (!tutor) {
            return res.redirect('/');
        }

        /*
         * Get all students assigned to this tutor
         */
        const students = await Student.find({
            assignedTutor: tutor._id,
            isDeleted: { $ne: true }
        }).sort({
            studentName: 1
        });


        /*
         * Selected date.
         *
         * If no date is provided,
         * today's date is selected.
         */
        const selectedDate =
            req.query.date ||
            new Date().toISOString().slice(0, 10);


        const date = attendanceDate(selectedDate);


        if (!date) {
            return res.status(400).send(
                'Invalid attendance date'
            );
        }


        /*
         * Find attendance sheet for:
         *
         * tutor + selected date
         */
        const currentRecord =
            await Attendance.findOne({
                tutor: tutor._id,
                date
            }).populate('students.student');


        /*
         * Store student statuses
         */
        const statusMap = {};
        const noteMap = {};


        (currentRecord?.students || []).forEach(item => {

            const studentId =
                String(
                    item.student?._id ||
                    item.student
                );

            statusMap[studentId] =
                item.status;

            noteMap[studentId] =
                item.note || '';
        });


        /*
         * Recent attendance records
         */
        const records =
            await Attendance.find({
                tutor: tutor._id
            })
            .sort({ date: -1 })
            .limit(60);


        res.render(
            'dashboard/tutor-attendance',
            {
                title: 'Attendance',
                tutor,
                students,
                records,
                currentRecord,
                statusMap,
                noteMap,
                selectedDate: userDate(selectedDate),
                user: req.session.user
            }
        );

    } catch (e) {

        console.log(e);

        res.status(500).send(
            'Server Error'
        );
    }
};


/* =========================================================
   MARK / SAVE DAILY ATTENDANCE
========================================================= */

exports.markAttendance = async (req, res) => {

    try {

        const tutor = await getTutor(req);

        if (!tutor) {
            return res.redirect('/');
        }


        /*
         * Convert selected date into
         * a proper UTC date.
         */
        const date =
            attendanceDate(req.body.date);


        if (!date) {
            return res.status(400).send(
                'Invalid attendance date'
            );
        }


        /*
         * Get all students assigned
         * to this tutor.
         */
        const students = await Student.find({
            assignedTutor: tutor._id,
            isDeleted: { $ne: true }
        }).sort({
            studentName: 1
        });


        /*
         * Attendance data coming
         * from the form.
         */
        const status = req.body.status || {};
        const notes = req.body.note || {};


        /*
         * Build attendance list.
         */
        const attendanceStudents =
            students.map(student => {

                const studentId =
                    String(student._id);

                const studentStatus =
                    status[studentId];


                /*
                 * Every student must be
                 * marked present or absent.
                 */
                if (
                    !['present', 'absent']
                        .includes(studentStatus)
                ) {
                    return null;
                }


                return {
                    student: student._id,
                    status: studentStatus,
                    note: String(
                        notes[studentId] || ''
                    ).trim()
                };
            });


        /*
         * Check if any student
         * was not marked.
         */
        if (
            attendanceStudents.some(
                item => item === null
            )
        ) {

            return res.status(400).send(
                'Please mark Present or Absent for every assigned student.'
            );
        }


        /*
         * IMPORTANT:
         *
         * Find attendance using:
         *
         * tutor + date
         *
         * If it already exists,
         * update it.
         *
         * Otherwise create a new record.
         */
        await Attendance.findOneAndUpdate(

            {
                tutor: tutor._id,
                date
            },

            {
                tutor: tutor._id,
                date,
                students: attendanceStudents
            },

            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
                runValidators: true
            }
        );


        /*
         * Send notification to
         * every student.
         *
         * IMPORTANT:
         *
         * We use the attendance DATE
         * instead of notification
         * createdAt.
         */
        for (
            const item of attendanceStudents
        ) {

            await notify(
                item.student,
                'Attendance updated',
                `Attendance for ${userDate(req.body.date)} marked ${item.status}.`
            );
        }


        /*
         * Return to the same
         * attendance date.
         */
        res.redirect(
            `/tutor/attendance?date=${userDate(
                req.body.date
            )}`
        );

    } catch (e) {

        console.log(e);

        res.status(500).send(
            'Server Error'
        );
    }
};


/* =========================================================
   ASSIGNMENTS
========================================================= */

exports.assignments = async (req, res) => {

    const tutor = await getTutor(req);

    const students = await Student.find({
        assignedTutor: tutor._id,
        isDeleted: { $ne: true }
    });

    const assignments =
        await Assignment.find({
            tutor: tutor._id
        })
        .populate('student')
        .sort({ createdAt: -1 });


    res.render(
        'dashboard/tutor-assignments',
        {
            title: 'Homework',
            tutor,
            students,
            assignments,
            user: req.session.user
        }
    );
};


/* =========================================================
   CREATE ASSIGNMENT
========================================================= */

exports.createAssignment = async (req, res) => {

    const tutor = await getTutor(req);

    const student =
        await Student.findOne({
            _id: req.body.student,
            assignedTutor: tutor._id,
            isDeleted: { $ne: true }
        });


    if (!student) {
        return res.status(403).send(
            'Student not assigned'
        );
    }


    const a =
        await Assignment.create({
            tutor: tutor._id,
            student: student._id,
            title: req.body.title,
            description: req.body.description,
            dueDate: req.body.dueDate
        });


    await notify(
        student._id,
        'New homework',
        `New homework: ${a.title}`
    );


    res.redirect('/tutor/homework');
};


/* =========================================================
   STUDY MATERIALS
========================================================= */

exports.materials = async (req, res) => {

    const tutor = await getTutor(req);

    const materials =
        await StudyMaterial.find({
            tutor: tutor._id
        })
        .sort({ createdAt: -1 });


    res.render(
        'dashboard/tutor-materials',
        {
            title: 'Study Materials',
            tutor,
            materials,
            user: req.session.user
        }
    );
};


/* =========================================================
   ADD STUDY MATERIAL
========================================================= */

exports.addMaterial = async (req, res) => {

    const tutor = await getTutor(req);

    const fileUrl =
        req.file
            ? '/uploads/materials/' +
              req.file.filename
            : req.body.fileUrl;


    await StudyMaterial.create({
        tutor: tutor._id,
        title: req.body.title,
        description: req.body.description,
        fileUrl,
        originalName:
            req.file?.originalname ||
            req.body.fileUrl
    });


    const students =
        await Student.find({
            assignedTutor: tutor._id,
            isDeleted: { $ne: true }
        });


    for (const s of students) {

        await notify(
            s._id,
            'New study material',
            `New material: ${req.body.title}`
        );
    }


    res.redirect('/tutor/notes');
};


/* =========================================================
   TESTS
========================================================= */

exports.tests = async (req, res) => {

    const tutor = await getTutor(req);

    const students =
        await Student.find({
            assignedTutor: tutor._id,
            isDeleted: { $ne: true }
        });


    const tests =
        await Test.find({
            tutor: tutor._id
        })
        .populate('student')
        .sort({ testDate: 1 });


    res.render(
        'dashboard/tutor-tests',
        {
            title: 'Tests',
            tutor,
            students,
            tests,
            user: req.session.user
        }
    );
};


/* =========================================================
   CREATE TEST
========================================================= */

exports.createTest = async (req, res) => {

    const tutor = await getTutor(req);

    const student =
        await Student.findOne({
            _id: req.body.student,
            assignedTutor: tutor._id,
            isDeleted: { $ne: true }
        });


    if (!student) {
        return res.status(403).send(
            'Student not assigned'
        );
    }


    await Test.create({
        tutor: tutor._id,
        student: student._id,
        title: req.body.title,
        description: req.body.description,
        testDate: req.body.testDate,
        maxMarks: req.body.maxMarks
    });


    await notify(
        student._id,
        'New test scheduled',
        `Test scheduled: ${req.body.title}`
    );


    res.redirect('/tutor/tests');
};


/* =========================================================
   GRADE TEST
========================================================= */

exports.gradeTest = async (req, res) => {

    const tutor = await getTutor(req);

    await Test.findOneAndUpdate(
        {
            _id: req.params.id,
            tutor: tutor._id
        },
        {
            marks: req.body.marks,
            feedback: req.body.feedback,
            status: 'completed'
        }
    );


    res.redirect('/tutor/tests');
};


/* =========================================================
   SCHEDULE
========================================================= */

exports.schedule = async (req, res) => {

    const tutor = await getTutor(req);

    const students =
        await Student.find({
            assignedTutor: tutor._id,
            isDeleted: { $ne: true }
        });


    const schedules =
        await Schedule.find({
            tutor: tutor._id
        })
        .populate('student')
        .sort({ createdAt: -1 });


    res.render(
        'dashboard/tutor-schedule',
        {
            title: 'Schedule',
            tutor,
            students,
            schedules,
            user: req.session.user
        }
    );
};


/* =========================================================
   CREATE SCHEDULE
========================================================= */

exports.createSchedule = async (req, res) => {

    const tutor = await getTutor(req);

    const student =
        await Student.findOne({
            _id: req.body.student,
            assignedTutor: tutor._id,
            isDeleted: { $ne: true }
        });


    if (!student) {
        return res.status(403).send(
            'Student not assigned'
        );
    }


    await Schedule.create({
        tutor: tutor._id,
        student: student._id,
        day: req.body.day,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        subject:
            req.body.subject ||
            student.subject,
        location: req.body.location,
        notes: req.body.notes
    });


    await notify(
        student._id,
        'Class scheduled',
        `${req.body.day} ${req.body.startTime}-${req.body.endTime}`
    );


    res.redirect('/tutor/schedule');
};


/* =========================================================
   STUDENT PROGRESS
========================================================= */

exports.progress = async (req, res) => {

    const tutor = await getTutor(req);

    const students =
        await Student.find({
            assignedTutor: tutor._id,
            isDeleted: { $ne: true }
        });


    const progress =
        await Progress.find({
            tutor: tutor._id
        })
        .populate('student')
        .sort({ createdAt: -1 });


    res.render(
        'dashboard/tutor-progress',
        {
            title: 'Student Progress',
            tutor,
            students,
            progress,
            user: req.session.user
        }
    );
};


/* =========================================================
   ADD PROGRESS
========================================================= */

exports.addProgress = async (req, res) => {

    const tutor = await getTutor(req);

    const student =
        await Student.findOne({
            _id: req.body.student,
            assignedTutor: tutor._id,
            isDeleted: { $ne: true }
        });


    if (!student) {
        return res.status(403).send(
            'Student not assigned'
        );
    }


    await Progress.create({
        tutor: tutor._id,
        student: student._id,
        topic: req.body.topic,
        score: req.body.score,
        remark: req.body.remark
    });


    await notify(
        student._id,
        'Progress updated',
        `Progress updated for ${
            req.body.topic || 'your studies'
        }.`
    );


    res.redirect('/tutor/progress');
};


/* =========================================================
   TUTOR PROFILE
========================================================= */

exports.profile = async (req, res) => {

    const tutor = await getTutor(req);

    res.render(
        'dashboard/tutor-profile',
        {
            title: 'Tutor Profile',
            tutor,
            user: req.session.user
        }
    );
};


/* =========================================================
   UPDATE TUTOR PROFILE
========================================================= */

exports.updateProfile = async (req, res) => {

    const tutor = await getTutor(req);

    const fields = [
        'name',
        'gender',
        'age',
        'maritalStatus',
        'qualification',
        'preferredTime',
        'jobLocation',
        'experience',
        'classesTeach',
        'subjectExpertise',
        'expectedSalary',
        'otherSkills',
        'personalVehicle',
        'areaCover',
        'address',
        'permanentAddress',
        'email',
        'contactNumber'
    ];


    fields.forEach(field => {

        if (req.body[field] !== undefined) {
            tutor[field] = req.body[field];
        }

    });


    await tutor.save();


    await User.findByIdAndUpdate(
        req.session.user.id,
        {
            name: tutor.name,
            email: tutor.email
        }
    );


    req.session.user.name = tutor.name;
    req.session.user.email = tutor.email;


    res.redirect('/tutor/profile');
};


/* =========================================================
   NOTIFICATIONS
========================================================= */

exports.notifications = async (req, res) => {

    const notifications =
        await Notification.find({
            user: req.session.user.id
        })
        .sort({ createdAt: -1 });


    await Notification.updateMany(
        {
            user: req.session.user.id
        },
        {
            read: true
        }
    );


    res.render(
        'dashboard/notifications',
        {
            title: 'Notifications',
            notifications,
            user: req.session.user
        }
    );
};


/* =========================================================
   MESSAGES
========================================================= */

exports.messages = async (req, res) => {

    const tutor = await getTutor(req);

    const students =
        await Student.find({
            assignedTutor: tutor._id,
            isDeleted: { $ne: true }
        })
        .populate('user');


    const ids =
        students
            .map(s => s.user?._id)
            .filter(Boolean);


    const messages =
        await Message.find({
            $or: [
                {
                    sender:
                        req.session.user.id
                },
                {
                    recipient:
                        req.session.user.id
                },
                {
                    sender: {
                        $in: ids
                    }
                },
                {
                    recipient: {
                        $in: ids
                    }
                }
            ]
        })
        .populate('sender recipient')
        .sort({
            createdAt: 1
        });


    res.render(
        'dashboard/messages',
        {
            title: 'Messages',
            messages,
            recipient: null,
            students,
            user: req.session.user
        }
    );
};


/* =========================================================
   SEND MESSAGE
========================================================= */

exports.sendMessage = async (req, res) => {

    const tutor = await getTutor(req);

    const student =
        await Student.findOne({
            _id: req.body.student,
            assignedTutor: tutor._id,
            isDeleted: { $ne: true }
        });


    if (
        student?.user &&
        req.body.body
    ) {

        await Message.create({
            sender: req.session.user.id,
            recipient: student.user,
            body: req.body.body
        });
    }


    res.redirect('/tutor/messages');
};


/* =========================================================
   CHANGE PASSWORD
========================================================= */

exports.changePassword = async (req, res) => {

    if (
        req.body.password !==
        req.body.confirmPassword
    ) {
        return res.status(400).send(
            'Passwords do not match'
        );
    }


    const user =
        await User.findById(
            req.session.user.id
        );


    if (
        !(
            await bcrypt.compare(
                req.body.currentPassword,
                user.password
            )
        )
    ) {

        return res.status(400).send(
            'Current password is incorrect'
        );
    }


    user.password =
        await bcrypt.hash(
            req.body.password,
            10
        );


    await user.save();


    res.redirect('/tutor/profile');
};


/* =========================================================
   EXPORT HELPER
========================================================= */

module.exports.getTutor = getTutor;
