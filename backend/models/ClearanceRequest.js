// backend/models/ClearanceRequest.js
const mongoose = require('mongoose');

const clearanceRequestSchema = new mongoose.Schema({
    // This connects this specific request to a Student in the User collection
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Points to the 'User' model
        required: true,
        unique: true // A student can only have ONE clearance request record in the system
    },
    // This object holds the status and rejection reason for all 7 departments
    statuses: {
        finance: {                   //enum blocks bad data and typos
            status: { type: String, enum: ['Not Sent', 'Pending', 'Approved', 'Rejected'], default: 'Not Sent' },
            reason: { type: String, default: '' }
        },
        datacell: {
            status: { type: String, enum: ['Not Sent', 'Pending', 'Approved', 'Rejected'], default: 'Not Sent' },
            reason: { type: String, default: '' }
        },
        lab: {
            status: { type: String, enum: ['Not Sent', 'Pending', 'Approved', 'Rejected'], default: 'Not Sent' },
            reason: { type: String, default: '' }
        },
        cafeteria: {
            status: { type: String, enum: ['Not Sent', 'Pending', 'Approved', 'Rejected'], default: 'Not Sent' },
            reason: { type: String, default: '' }
        },
        library: {
            status: { type: String, enum: ['Not Sent', 'Pending', 'Approved', 'Rejected'], default: 'Not Sent' },
            reason: { type: String, default: '' }
        },
        photocopier: {
            status: { type: String, enum: ['Not Sent', 'Pending', 'Approved', 'Rejected'], default: 'Not Sent' },
            reason: { type: String, default: '' }
        },
        report: {
            status: { type: String, enum: ['Not Sent', 'Pending', 'Approved', 'Rejected'], default: 'Not Sent' },
            reason: { type: String, default: '' }
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('ClearanceRequest', clearanceRequestSchema);