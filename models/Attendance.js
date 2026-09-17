
const mongoose = require('mongoose');

const attendanceStudentSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'StudentEnrollment',
            required: true
        },

        status: {
            type: String,
            enum: ['present', 'absent'],
            required: true
        },

        note: {
            type: String,
            default: ''
        }
    },
    {
        _id: false
    }
);


const attendanceSchema = new mongoose.Schema(
    {
        /*
         * Tutor whose attendance sheet this belongs to
         */
        tutor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TutorEnrollment',
            required: true,
            index: true
        },


        /*
         * Date of the attendance.
         *
         * One tutor can have only one
         * attendance sheet for a particular date.
         */
        date: {
            type: Date,
            required: true,
            index: true
        },


        /*
         * All students' attendance for
         * this tutor and date.
         */
        students: {
            type: [attendanceStudentSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
);


/*
 * Prevent duplicate attendance sheets
 * for the same tutor on the same date.
 *
 * Example:
 *
 * Tutor A + 14 Sept → only ONE record
 * Tutor A + 15 Sept → another record
 * Tutor B + 14 Sept → another record
 */
attendanceSchema.index(
    {
        tutor: 1,
        date: 1
    },
    {
        unique: true
    }
);


module.exports =
    mongoose.model(
        'Attendance',
        attendanceSchema
    );

