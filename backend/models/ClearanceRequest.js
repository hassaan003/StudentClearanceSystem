// backend/models/ClearanceRequest.js
const mongoose = require('mongoose');

const clearanceRequestSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true 
    },
    statuses: {
        finance: {                 
            status: { type: String, enum: ['Not Sent', 'Pending', 'Approved', 'Rejected','Resubmitted'], default: 'Not Sent' },
            reason: { type: String, default: '' }
        },
        datacell: {
            status: { type: String, enum: ['Not Sent', 'Pending', 'Approved', 'Rejected','Resubmitted'], default: 'Not Sent' },
            reason: { type: String, default: '' }
        },
        lab: {
            status: { type: String, enum: ['Not Sent', 'Pending', 'Approved', 'Rejected','Resubmitted'], default: 'Not Sent' },
            reason: { type: String, default: '' }
        },
        cafeteria: {
            status: { type: String, enum: ['Not Sent', 'Pending', 'Approved', 'Rejected','Resubmitted'], default: 'Not Sent' },
            reason: { type: String, default: '' }
        },
        library: {
            status: { type: String, enum: ['Not Sent', 'Pending', 'Approved', 'Rejected','Resubmitted'], default: 'Not Sent' },
            reason: { type: String, default: '' }
        },
        photocopier: {
            status: { type: String, enum: ['Not Sent', 'Pending', 'Approved', 'Rejected','Resubmitted'], default: 'Not Sent' },
            reason: { type: String, default: '' }
        },
        report: {
            status: { type: String, enum: ['Not Sent', 'Pending', 'Approved', 'Rejected','Resubmitted'], default: 'Not Sent' },
            reason: { type: String, default: '' }
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('ClearanceRequest', clearanceRequestSchema);