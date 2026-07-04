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

// ==========================================
// NEW MOCK SCHEMAS (Mimicking University SQL Tables)
// ==========================================
// 1. Accgpa Table
const accgpaSchema = new mongoose.Schema({
    REG_NO: String,
    CGPA: Number
});
const Accgpa = mongoose.model('Accgpa', accgpaSchema);

// 2. CrsFail Table
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

// ==========================================
// NEW: SEED ROUTE (Sets up DB instantly without Signup)
// ==========================================
app.get('/api/seed', async (req, res) => {
    try {
        // 1. Clear existing test data to prevent duplicates
        // await User.deleteMany({});
        // await Accgpa.deleteMany({});
        // await CrsFail.deleteMany({});
        
        // 2. Seed Department Admins
        const departments = ['finance', 'datacell', 'lab', 'cafeteria', 'library', 'photocopier', 'report'];
        const adminDocs = departments.map(dept => ({
            name: `${dept.toUpperCase()} Head`,
            registeration_no: `admin-${dept}`,
            password: '123',
            phoneNumber: '000',
            department: dept,
            role: dept
        }));

        // 3. Seed Test Students
        const studentDocs = [
            { name: "Hassaan", registeration_no: "4010", password: "123", phoneNumber: "0340", department: "CS", role: "student" },
            { name: "Ali ", registeration_no: "4096", password: "123", phoneNumber: "0333", department: "SE", role: "student" },
            { name: "Sara", registeration_no: "4001", password: "123", phoneNumber: "0300", department: "CS", role: "student" },
            { name: "Zain", registeration_no: "4002", password: "123", phoneNumber: "0311", department: "IT", role: "student" }
        ];


        await User.insertMany([...adminDocs, ...studentDocs]);

        // 4. Seed Legacy Accgpa Data
        await Accgpa.insertMany([
            { REG_NO: "4010", CGPA: 3.2 }, // Hassaan - Passes
            { REG_NO: "4096", CGPA: 2.1 }, // Ali - Fails CGPA check
            { REG_NO: "4001", CGPA: 2.8 }, // Sara - Passes CGPA check
            { REG_NO: "4002", CGPA: 1.9 }  // Zain - Fails CGPA check
        ]);

        // 5. Seed Legacy CrsFail Data
        await CrsFail.insertMany([
            { REG_NO: "4001", Course_no: "CS-101", grade: "F" }, // Sara has 1 F
            { REG_NO: "4002", Course_no: "MTH-310", grade: "F" }, // Zain has 2 Fs
            { REG_NO: "4002", Course_no: "CS-666", grade: "F" }
            // Notice Hassaan and Ali have NO records here, meaning 0 failed courses!
        ]);

        res.json({ message: "Database seeded successfully! You can now log in with the test accounts." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// NEW: ELIGIBILITY CHECK ROUTE
// ==========================================
app.get('/api/check-eligibility', async (req, res) => {
    try {
        const { registeration_no } = req.query;

        // 1. Check CGPA from Accgpa table
        const accgpaRecord = await Accgpa.findOne({ REG_NO: registeration_no });
        const cgpa = accgpaRecord ? accgpaRecord.CGPA : 0;

        // 2. Check Failed Courses from CrsFail table
        const failedCoursesCount = await CrsFail.countDocuments({ REG_NO: registeration_no, grade: 'F' });

        // 3. Determine Eligibility
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

// ==========================================
// Existing Routes (Untouched Core Logic)
// ==========================================
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

app.get('/api/clearance/my-status', async (req, res) => {
    try {
        const clearance = await ClearanceRequest.findOne({ studentId: req.query.studentId });
        res.status(200).json({ clearance: clearance || null });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/clearance/pending', async (req, res) => {
    try {
        const { departmentRole } = req.query;
        const pendingStudents = await ClearanceRequest.find({ [`statuses.${departmentRole}.status`]: 'Pending' })
            .populate('studentId', 'name registeration_no department phoneNumber');
        res.status(200).json({ requests: pendingStudents });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/clearance/rejected', async (req, res) => {
    try {
        const { departmentRole } = req.query;
        const rejectedStudents = await ClearanceRequest.find({ 
            $or: [
                { [`statuses.${departmentRole}.status`]: 'Rejected' },
                { [`statuses.${departmentRole}.status`]: 'Resubmitted' }
            ]
        }).populate('studentId', 'name registeration_no department phoneNumber');
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
        const approvedStudents = await ClearanceRequest.find({ [`statuses.${req.query.departmentRole}.status`]: 'Approved' })
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