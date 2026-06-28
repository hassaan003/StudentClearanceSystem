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
        unique: true
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
        trim: true 
    },
    role: {
        type: String,
        enum: ['student', 'finance', 'datacell', 'lab', 'cafeteria', 'library', 'report', 'photocopier'],

        default: 'student' 
    }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

