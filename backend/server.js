// backend/server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/clearance_system';
mongoose.set('strictQuery', false);
const connectDb = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log(`✅ MongoDB connected: ${MONGODB_URI}`);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};
const User = require('./models/User');
const ClearanceRequest = require('./models/ClearanceRequest');
const accgpaSchema = new mongoose.Schema({
    REG_NO: String,
    CGPA: Number
});


const Accgpa = mongoose.model('Accgpa', accgpaSchema);
const crsFailSchema = new mongoose.Schema({
    REG_NO: String,
    Course_no: String,
    grade: String
});
const CrsFail = mongoose.model('CrsFail', crsFailSchema);
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.get('/api/test', (req, res) => {
    res.json({ message: "Backend connected successfully!" });
});


app.get('/api/seed', async (req, res) => {
    try {
        // await User.deleteMany({});
        // await Accgpa.deleteMany({});
        // await CrsFail.deleteMany({});
        const departments = ['finance', 'datacell', 'lab', 'cafeteria', 'library', 'photocopier', 'report'];
        const adminDocs = departments.map(dept => ({
            name: `${dept.toUpperCase()} Head`,
            registeration_no: `admin-${dept}`,
            password: '123',
            phoneNumber: '000',
            department: dept,
            role: dept
        }));
        const studentDocs = [
            { name: "Hassaan", registeration_no: "4010", password: "123", phoneNumber: "0340", department: "CS", role: "student" },
            { name: "Ali ", registeration_no: "4096", password: "123", phoneNumber: "0333", department: "SE", role: "student" },
            { name: "Ahmed", registeration_no: "4003", password: "123", phoneNumber: "0347", department: "CS", role: "student" },
            { name: "Sara", registeration_no: "4001", password: "123", phoneNumber: "0300", department: "CS", role: "student" },
            { name: "Zain", registeration_no: "4002", password: "123", phoneNumber: "0311", department: "IT", role: "student" }
        ];
        await User.insertMany([...adminDocs, ...studentDocs]);
        await Accgpa.insertMany([
            { REG_NO: "4010", CGPA: 3.2 }, // Hassaan - Passes
            { REG_NO: "4096", CGPA: 2.1 }, // Ali - Fails CGPA check
            { REG_NO: "4003", CGPA: 3.0 }, // Ahmed - Passes CGPA check
            { REG_NO: "4001", CGPA: 2.8 }, // Sara - Passes CGPA check
            { REG_NO: "4002", CGPA: 1.9 }  // Zain - Fails CGPA check
        ]);
        await CrsFail.insertMany([
            { REG_NO: "4001", Course_no: "CS-101", grade: "F" }, // Sara has 1 F
            { REG_NO: "4002", Course_no: "MTH-310", grade: "F" }, // Zain has 2 Fs
            { REG_NO: "4002", Course_no: "CS-666", grade: "F" }
        ]);
        res.json({ message: "Database seeded successfully! You can now log in with the test accounts." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.get('/api/check-eligibility', async (req, res) => {
    try {
        const { registeration_no } = req.query;
        const accgpaRecord = await Accgpa.findOne({ REG_NO: registeration_no });
        const cgpa = accgpaRecord ? accgpaRecord.CGPA : 0;
        const failedCoursesCount = await CrsFail.countDocuments({ REG_NO: registeration_no, grade: 'F' });
        const isEligible = (cgpa >= 2.5) && (failedCoursesCount === 0);

        res.json({
            cgpa: cgpa,
            failedCourses: failedCoursesCount,
            isEligible: isEligible
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/login', async (req, res) => {
    try {
        const { registeration_no, password } = req.body;
        const user = await User.findOne({ registeration_no });

        if (!user || user.password !== password) {
            return res.status(400).json({ message: "Invalid Registration Number or Password" });
        }
        res.status(200).json({
            message: "Login successful!",
            user: { id: user._id, name: user.name, registeration_no: user.registeration_no, role: user.role, department: user.department }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/clearance/request', async (req, res) => {
    try {
        const { studentId } = req.body;
        const existingRequest = await ClearanceRequest.findOne({ studentId });
        if (existingRequest) return res.status(400).json({ message: "Already initiated!" });

        const newRequest = new ClearanceRequest({
            studentId,
            statuses: {
                finance: { status: 'Pending', reason: '' },
                datacell: { status: 'Pending', reason: '' },
                lab: { status: 'Pending', reason: '' },
                cafeteria: { status: 'Pending', reason: '' },
                library: { status: 'Pending', reason: '' },
                photocopier: { status: 'Pending', reason: '' },
                report: { status: 'Pending', reason: '' }
            }
        });
        const savedRequest = await newRequest.save();
        res.status(201).json({ message: "Initiated!", clearance: savedRequest });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/getFailedCourses', async (req, res) => {
    try {
        const { registeration_no } = req.query;
        const failedCourses = await CrsFail.find({ REG_NO: registeration_no });

        res.status(200).json({ failedCourses });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/clearance/my-status', async (req, res) => {
    try {
        const clearance = await ClearanceRequest.findOne({ studentId: req.query.studentId });
        res.status(200).json({ clearance: clearance || null });
    } catch (error) { res.status(500).json({ error: error.message }); }
});
app.get('/api/clearance/pending', async (req, res) => {
    try {
        const { departmentRole } = req.query;
        const dynamicQuery = {
            [`statuses.${departmentRole}.status`]: { $in: ['Pending', 'Resubmitted'] }
        };
        const pendingStudents = await ClearanceRequest.find(dynamicQuery)
            .populate('studentId', 'name registeration_no department phoneNumber');
        res.status(200).json({ requests: pendingStudents });
    } catch (error) { res.status(500).json({ error: error.message }); }
});
app.get('/api/clearance/rejected', async (req, res) => {
    try {
        const { departmentRole } = req.query;
        const dynamicQuery = {
            [`statuses.${departmentRole}.status`]: 'Rejected'
        };

        const rejectedStudents = await ClearanceRequest.find(dynamicQuery)
            .populate('studentId', 'name registeration_no department phoneNumber');
        res.status(200).json({ requests: rejectedStudents });
    } catch (error) { res.status(500).json({ error: error.message }); }
});
app.post('/api/clearance/resubmit', async (req, res) => {
    try {
        const { studentId, departmentRole } = req.body;
        const request = await ClearanceRequest.findOne({ studentId });
        request.statuses[departmentRole].status = 'Resubmitted';
        const updated = await request.save();
        res.status(200).json({ message: "Resubmitted!", clearance: updated });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/clearance/approved', async (req, res) => {
    try {
        const dynamicQuery = {
            [`statuses.${req.query.departmentRole}.status`]: 'Approved'
        };
        const approvedStudents = await ClearanceRequest.find(dynamicQuery)
            .populate('studentId', 'name registeration_no');
        res.status(200).json({ requests: approvedStudents });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/clearance/action', async (req, res) => {
    try {
        const { requestId, departmentRole, action, reason } = req.body;
        const request = await ClearanceRequest.findById(requestId);
        request.statuses[departmentRole].status = action;
        request.statuses[departmentRole].reason = action === 'Rejected' ? (reason || '') : '';
        const updated = await request.save();
        res.status(200).json({ message: `Updated to ${action}!`, clearance: updated });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

const startServer = async () => {
    await connectDb();
    app.listen(PORT, () => { console.log(`🚀 Server running on http://localhost:${PORT}`); });
};
startServer();
