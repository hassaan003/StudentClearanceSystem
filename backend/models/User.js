// backend/models/User.js
const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    registeration_no: {
        type: String,
        required: true,
        trim: true,
        unique: true // Prevents two students with the same Roll No
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    department: {
        type: String,
        required: true,
        trim: true // e.g., "CS", "EE", "BBA"
    },
    role: {
        type: String,
        enum: ['student', 'finance', 'datacell', 'lab', 'cafeteria', 'library', 'report', 'photocopier'],

        default: 'student' // Automatically assigns 'student' if no role is given

    }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

