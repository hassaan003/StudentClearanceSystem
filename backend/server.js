// // backend/server.js
// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// require('dotenv').config();
// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/backup';
// mongoose.set('strictQuery', false);
// const connectDb = async () => {
//     try {
//         await mongoose.connect(MONGODB_URI);
//         console.log(`✅ MongoDB connected: ${MONGODB_URI}`);
//     } catch (error) {
//         console.error('❌ MongoDB connection error:', error);
//         process.exit(1);
//     }
// };
// const User = require('./models/User');
// const ClearanceRequest = require('./models/ClearanceRequest');
// const accgpaSchema = new mongoose.Schema({
//     REG_NO: String,
//     CGPA: Number
// });


// const Accgpa = mongoose.model('Accgpa', accgpaSchema);
// const crsFailSchema = new mongoose.Schema({
//     REG_NO: String,
//     Course_no: String,
//     grade: String
// });
// const CrsFail = mongoose.model('CrsFail', crsFailSchema);
// const app = express();
// const PORT = process.env.PORT || 5000;
// app.use(cors());
// app.use(express.json());
// app.get('/api/test', (req, res) => {
//     res.json({ message: "Backend connected successfully!" });
// });


// app.get('/api/seed', async (req, res) => {
//     try {
//         // await User.deleteMany({});
//         // await Accgpa.deleteMany({});
//         // await CrsFail.deleteMany({});
//         const departments = ['finance', 'datacell', 'lab', 'cafeteria', 'library', 'photocopier', 'report'];
//         const adminDocs = departments.map(dept => ({
//             name: `${dept.toUpperCase()} Head`,
//             registeration_no: `admin-${dept}`,
//             password: '123',
//             phoneNumber: '000',
//             department: dept,
//             role: dept
//         }));

//         const studentDocs = [
//             { name: "Hassaan", registeration_no: "4010", password: "123", phoneNumber: "0340", department: "CS", role: "student" },
//             { name: "Ali ", registeration_no: "4096", password: "123", phoneNumber: "0333", department: "SE", role: "student" },
//             { name: "Ahmed", registeration_no: "4003", password: "123", phoneNumber: "0347", department: "CS", role: "student" },
//             { name: "Sara", registeration_no: "4001", password: "123", phoneNumber: "0300", department: "CS", role: "student" },
//             { name: "Zain", registeration_no: "4002", password: "123", phoneNumber: "0311", department: "IT", role: "student" },
//             { name: "Zain", registeration_no: "1998-ARID-0441", password: "123", phoneNumber: "0312", department: "IT", role: "student" },
//             { name: "Zain", registeration_no: "4004", password: "123", phoneNumber: "03232", department: "IT", role: "student" },
//             { name: "Ayyan", registeration_no: "1998-ARID-0442", password: "123", phoneNumber: "0313", department: "IT", role: "student" }
//         ];
//         await User.insertMany([...adminDocs, ...studentDocs]);
//         await Accgpa.insertMany([
//             { REG_NO: "4010", CGPA: 3.2 }, // Hassaan - Passes
//             { REG_NO: "4096", CGPA: 2.1 }, // Ali - Fails CGPA check
//             { REG_NO: "4003", CGPA: 3.0 }, // Ahmed - Passes CGPA check
//             { REG_NO: "4001", CGPA: 2.8 }, // Sara - Passes CGPA check
//             { REG_NO: "4002", CGPA: 1.9 },
//             { REG_NO: "4004", CGPA: 4.0 },
//             { REG_NO: "1998-ARID-0441", CGPA: 2.5 },
//             { REG_NO: "1998-ARID-0442", CGPA: 2.0 }
//         ]);
//         await CrsFail.insertMany([
//             { REG_NO: "4001", Course_no: "CS-101", grade: "F" }, // Sara has 1 F
//             { REG_NO: "4002", Course_no: "MTH-310", grade: "F" }, // Zain has 2 Fs
//             { REG_NO: "4002", Course_no: "CS-666", grade: "F" },
//             { REG_NO: "4003", Course_no: "CS-667", grade: "F" }

//         ]);
//         res.json({ message: "Database seeded successfully! You can now log in with the test accounts." });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // app.get('/api/check-eligibility', async (req, res) => {
// //     try {
// //         const { registeration_no } = req.query;
// //         const accgpaRecord = await Accgpa.findOne({ REG_NO: registeration_no });
// //         const cgpa = accgpaRecord ? accgpaRecord.CGPA : 0;
// //         const failedCoursesCount = await CrsFail.countDocuments({ REG_NO: registeration_no, grade: 'F' });
// //         const isEligible = (cgpa >= 2.5) && (failedCoursesCount === 0);

// //         res.json({
// //             cgpa: cgpa,
// //             failedCourses: failedCoursesCount,
// //             isEligible: isEligible
// //         });
// //     } catch (error) {
// //         res.status(500).json({ error: error.message });
// //     }
// // });

// app.get('/api/check-eligibility', async (req, res) => {
//     try {
//         const { registeration_no } = req.query;
//         const accgpaRecord = await Accgpa.findOne({ REG_NO: registeration_no });
//         const cgpa = accgpaRecord ? accgpaRecord.CGPA : 0;
//         const failedCoursesList = await CrsFail.find({ REG_NO: registeration_no, grade: 'F' });
//         const failedCoursesCount = await failedCoursesList.length;
//         const passesStandardRule = (cgpa >= 2.5) && (failedCoursesCount === 0);
//         const passesExemptionRule = (cgpa >= 3) && (failedCoursesCount === 1);
//         const isEligible = passesStandardRule || passesExemptionRule;

//         res.json({ cgpa: cgpa, failedCourses: failedCoursesCount, failedCoursesList: failedCoursesList, isEligible: isEligible });

//     }
//     catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// app.post('/api/login', async (req, res) => {
//     try {
//         const { registeration_no, password } = req.body;
//         const user = await User.findOne({ registeration_no });

//         if (!user || user.password !== password) {
//             return res.status(400).json({ message: "Invalid Registration Number or Password" });
//         }
//         res.status(200).json({
//             message: "Login successful!",
//             user: { id: user._id, name: user.name, registeration_no: user.registeration_no, role: user.role, department: user.department }
//         });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// app.post('/api/clearance/request', async (req, res) => {
//     try {
//         const { studentId } = req.body;
//         const existingRequest = await ClearanceRequest.findOne({ studentId });
//         if (existingRequest) return res.status(400).json({ message: "Already initiated!" });

//         const user = await User.findById(studentId);
//         const cgpaRecord=await Accgpa.findOne({REG_NO:user.registeration_no});
//         const cgp=cgpaRecord? cgpaRecord.CGPA:0;

//         let initialStatuses =
//         {
//             finance: { status: 'Pending', reason: '' },
//             datacell: { status: 'Pending', reason: '' },
//             lab: { status: 'Pending', reason: '' },
//             cafeteria: { status: 'Pending', reason: '' },
//             library: { status: 'Pending', reason: '' },
//             photocopier: { status: 'Pending', reason: '' },
//             report: { status: 'Pending', reason: '' }
//         };

//         if(cgp===4.0){
//             initialStatuses.datacell.status='Approved';
//         }

//         const newRequest=new ClearanceRequest({
//             studentId,
//             statuses:initialStatuses
//         });

//         const savedRequest = await newRequest.save();
//         res.status(201).json({ message: "Initiated!", clearance: savedRequest });
//     } catch (error) { res.status(500).json({ error: error.message }); }
// });

// app.get('/api/getFailedCourses', async (req, res) => {
//     try {
//         const { registeration_no } = req.query;
//         const failedCourses = await CrsFail.find({ REG_NO: registeration_no });

//         res.status(200).json({ failedCourses });
//     }
//     catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// app.get('/api/clearance/my-status', async (req, res) => {
//     try {
//         const clearance = await ClearanceRequest.findOne({ studentId: req.query.studentId });
//         res.status(200).json({ clearance: clearance || null });
//     } catch (error) { res.status(500).json({ error: error.message }); }
// });
// app.get('/api/clearance/pending', async (req, res) => {
//     try {
//         const { departmentRole } = req.query;
//         const dynamicQuery = {
//             [`statuses.${departmentRole}.status`]: { $in: ['Pending', 'Resubmitted'] }
//         };
//         const pendingStudents = await ClearanceRequest.find(dynamicQuery)
//             .populate('studentId', 'name registeration_no department phoneNumber');
//         res.status(200).json({ requests: pendingStudents });
//     } catch (error) { res.status(500).json({ error: error.message }); }
// });
// app.get('/api/clearance/rejected', async (req, res) => {
//     try {
//         const { departmentRole } = req.query;
//         const dynamicQuery = {
//             [`statuses.${departmentRole}.status`]: 'Rejected'
//         };

//         const rejectedStudents = await ClearanceRequest.find(dynamicQuery)
//             .populate('studentId', 'name registeration_no department phoneNumber');
//         res.status(200).json({ requests: rejectedStudents });
//     } catch (error) { res.status(500).json({ error: error.message }); }
// });
// app.post('/api/clearance/resubmit', async (req, res) => {
//     try {
//         const { studentId, departmentRole } = req.body;
//         const request = await ClearanceRequest.findOne({ studentId });
//         request.statuses[departmentRole].status = 'Resubmitted';
//         const updated = await request.save();
//         res.status(200).json({ message: "Resubmitted!", clearance: updated });
//     } catch (error) { res.status(500).json({ error: error.message }); }
// });
// app.get('/api/clearance/approved', async (req, res) => {
//     try {
//         const dynamicQuery = {
//             [`statuses.${req.query.departmentRole}.status`]: 'Approved'
//         };
//         const approvedStudents = await ClearanceRequest.find(dynamicQuery)
//             .populate('studentId', 'name registeration_no');
//         res.status(200).json({ requests: approvedStudents });
//     } catch (error) { res.status(500).json({ error: error.message }); }
// });
// app.post('/api/clearance/action', async (req, res) => {
//     try {
//         const { requestId, departmentRole, action, reason } = req.body;
//         const request = await ClearanceRequest.findById(requestId);
//         request.statuses[departmentRole].status = action;
//         request.statuses[departmentRole].reason = action === 'Rejected' ? (reason || '') : '';
//         const updated = await request.save();
//         res.status(200).json({ message: `Updated to ${action}!`, clearance: updated });
//     } catch (error) { res.status(500).json({ error: error.message }); }
// });

// const startServer = async () => {
//     await connectDb();
//     app.listen(PORT, () => { console.log(`🚀 Server running on http://localhost:${PORT}`); });
// };
// startServer();



const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/backup';
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

// Seed Route
app.get('/api/seed', async (req, res) => {
    try {
        await User.deleteMany({});
        await Accgpa.deleteMany({});
        await CrsFail.deleteMany({});
        
        // 🔥 FIX: Clear out old ghost clearance requests so they don't point to deleted users
        await ClearanceRequest.deleteMany({}); 

        const departments = ['finance', 'datacell', 'lab', 'cafeteria', 'library', 'photocopier', 'report'];
        const adminDocs = departments.map(dept => ({
            name: `${dept.toUpperCase()} Head`,
            registeration_no: `admin-${dept}`,
            password: '123',
            phoneNumber: '000',
            department: dept,
            role: dept
        }));

        // Adding the Director role account
        adminDocs.push({
            name: "Director Academics",
            registeration_no: "admin-director",
            password: "123",
            phoneNumber: "00000000000",
            department: "Directorate",
            role: "director"
        });

        const studentDocs = [
            { name: "Hassaan", registeration_no: "4010", password: "123", phoneNumber: "0340", department: "CS", role: "student" },
            { name: "Ali", registeration_no: "4096", password: "123", phoneNumber: "0333", department: "SE", role: "student" },
            { name: "Ahmed", registeration_no: "4003", password: "123", phoneNumber: "0347", department: "CS", role: "student" },
            { name: "Sara", registeration_no: "4001", password: "123", phoneNumber: "0300", department: "CS", role: "student" },
            { name: "Zain", registeration_no: "4002", password: "123", phoneNumber: "0311", department: "IT", role: "student" },
            { name: "Zain B", registeration_no: "1998-ARID-0441", password: "123", phoneNumber: "0312", department: "IT", role: "student" },
            { name: "Zain C", registeration_no: "4004", password: "123", phoneNumber: "03232", department: "IT", role: "student" },
            { name: "Ayyan", registeration_no: "1998-ARID-0442", password: "123", phoneNumber: "0313", department: "IT", role: "student" }
        ];

        await User.insertMany([...adminDocs, ...studentDocs]);

        await Accgpa.insertMany([
            { REG_NO: "4010", CGPA: 3.2 },
            { REG_NO: "4096", CGPA: 2.1 },
            { REG_NO: "4003", CGPA: 3.0 },
            { REG_NO: "4001", CGPA: 2.8 },
            { REG_NO: "4002", CGPA: 1.9 },
            { REG_NO: "4004", CGPA: 4.0 },
            { REG_NO: "1998-ARID-0441", CGPA: 2.5 },
            { REG_NO: "1998-ARID-0442", CGPA: 2.0 }
        ]);

        await CrsFail.insertMany([
            { REG_NO: "4001", Course_no: "CS-101", grade: "F" },
            { REG_NO: "4002", Course_no: "MTH-310", grade: "F" },
            { REG_NO: "4002", Course_no: "CS-666", grade: "F" },
            { REG_NO: "4003", Course_no: "CS-667", grade: "F" }
        ]);

        res.json({ message: "Database seeded successfully! You can now log in with the test accounts." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Check Eligibility Endpoint
app.get('/api/check-eligibility', async (req, res) => {
    try {
        const { registeration_no } = req.query;
        const accgpaRecord = await Accgpa.findOne({ REG_NO: registeration_no });
        const cgpa = accgpaRecord ? accgpaRecord.CGPA : 0;
        
        const failedCoursesList = await CrsFail.find({ REG_NO: registeration_no, grade: 'F' });
        const failedCoursesCount = failedCoursesList.length; // Fixed: Removed redundant 'await' on .length
        
        const passesStandardRule = (cgpa >= 2.5) && (failedCoursesCount === 0);
        const passesExemptionRule = (cgpa >= 3.0) && (failedCoursesCount === 1);
        const isEligible = passesStandardRule || passesExemptionRule;

        res.json({ 
            cgpa, 
            failedCourses: failedCoursesCount, 
            failedCoursesList, 
            isEligible 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { registeration_no, password } = req.body;
        const user = await User.findOne({ registeration_no });

        if (!user || user.password !== password) {
            return res.status(400).json({ message: "Invalid Registration Number or Password" });
        }
        res.status(200).json({
            message: "Login successful!",
            user: { 
                id: user._id, 
                name: user.name, 
                registeration_no: user.registeration_no, 
                role: user.role, 
                department: user.department 
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Clearance Request Endpoint (Includes 4.0 CGPA Datacell Auto-Approval)
app.post('/api/clearance/request', async (req, res) => {
    try {
        const { studentId } = req.body;
        const existingRequest = await ClearanceRequest.findOne({ studentId });
        if (existingRequest) return res.status(400).json({ message: "Already initiated!" });

        const user = await User.findById(studentId);
        if (!user) return res.status(404).json({ message: "Student record not found." });

        const cgpaRecord = await Accgpa.findOne({ REG_NO: user.registeration_no });
        const cgp = cgpaRecord ? cgpaRecord.CGPA : 0;

        let initialStatuses = {
            finance: { status: 'Pending', reason: '' },
            datacell: { status: 'Pending', reason: '' },
            lab: { status: 'Pending', reason: '' },
            cafeteria: { status: 'Pending', reason: '' },
            library: { status: 'Pending', reason: '' },
            photocopier: { status: 'Pending', reason: '' },
            report: { status: 'Pending', reason: '' }
        };

        if (cgp === 4.0) {
            initialStatuses.datacell.status = 'Approved';
        }

        const newRequest = new ClearanceRequest({
            studentId,
            statuses: initialStatuses
        });

        const savedRequest = await newRequest.save();
        res.status(201).json({ message: "Initiated!", clearance: savedRequest });
    } catch (error) { 
        res.status(500).json({ error: error.message }); 
    }
});

// Fetch Failed Courses
app.get('/api/getFailedCourses', async (req, res) => {
    try {
        const { registeration_no } = req.query;
        const failedCourses = await CrsFail.find({ REG_NO: registeration_no });
        res.status(200).json({ failedCourses });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Student Status Endpoint
app.get('/api/clearance/my-status', async (req, res) => {
    try {
        const clearance = await ClearanceRequest.findOne({ studentId: req.query.studentId });
        res.status(200).json({ clearance: clearance || null });
    } catch (error) { 
        res.status(500).json({ error: error.message }); 
    }
});

// Department Pending Requests
app.get('/api/clearance/pending', async (req, res) => {
    try {
        const { departmentRole } = req.query;
        const dynamicQuery = {
            [`statuses.${departmentRole}.status`]: { $in: ['Pending', 'Resubmitted'] }
        };
        const pendingReqs = await ClearanceRequest.find(dynamicQuery).lean();
        
        const users = await User.find().lean();
        const userMap = {};
        users.forEach(u => userMap[u._id.toString()] = u);

        const pendingStudents = pendingReqs.map(reqDoc => ({
            ...reqDoc,
            studentId: userMap[reqDoc.studentId?.toString()] || null
        }));

        res.status(200).json({ requests: pendingStudents });
    } catch (error) { 
        res.status(500).json({ error: error.message }); 
    }
});

// Department Rejected Requests
app.get('/api/clearance/rejected', async (req, res) => {
    try {
        const { departmentRole } = req.query;
        const dynamicQuery = {
            [`statuses.${departmentRole}.status`]: 'Rejected'
        };
        const rejectedReqs = await ClearanceRequest.find(dynamicQuery).lean();
        
        const users = await User.find().lean();
        const userMap = {};
        users.forEach(u => userMap[u._id.toString()] = u);

        const rejectedStudents = rejectedReqs.map(reqDoc => ({
            ...reqDoc,
            studentId: userMap[reqDoc.studentId?.toString()] || null
        }));

        res.status(200).json({ requests: rejectedStudents });
    } catch (error) { 
        res.status(500).json({ error: error.message }); 
    }
});

// Resubmit Clearance Request
app.post('/api/clearance/resubmit', async (req, res) => {
    try {
        const { studentId, departmentRole } = req.body;
        const request = await ClearanceRequest.findOne({ studentId });
        request.statuses[departmentRole].status = 'Resubmitted';
        const updated = await request.save();
        res.status(200).json({ message: "Resubmitted!", clearance: updated });
    } catch (error) { 
        res.status(500).json({ error: error.message }); 
    }
});

// Department Approved Requests
app.get('/api/clearance/approved', async (req, res) => {
    try {
        const dynamicQuery = {
            [`statuses.${req.query.departmentRole}.status`]: 'Approved'
        };
        const approvedReqs = await ClearanceRequest.find(dynamicQuery).lean();
        
        const users = await User.find().lean();
        const userMap = {};
        users.forEach(u => userMap[u._id.toString()] = u);

        const approvedStudents = approvedReqs.map(reqDoc => ({
            ...reqDoc,
            studentId: userMap[reqDoc.studentId?.toString()] || null
        }));

        res.status(200).json({ requests: approvedStudents });
    } catch (error) { 
        res.status(500).json({ error: error.message }); 
    }
});

// Clearance Action (Approve / Reject)
app.post('/api/clearance/action', async (req, res) => {
    try {
        const { requestId, departmentRole, action, reason } = req.body;
        const request = await ClearanceRequest.findById(requestId);
        request.statuses[departmentRole].status = action;
        request.statuses[departmentRole].reason = action === 'Rejected' ? (reason || '') : '';
        const updated = await request.save();
        res.status(200).json({ message: `Updated to ${action}!`, clearance: updated });
    } catch (error) { 
        res.status(500).json({ error: error.message }); 
    }
});

// Director Stats & Overview Endpoint
app.get('/api/clearance/stats', async (req, res) => {
    try {
        const allRequestsRaw = await ClearanceRequest.find().lean();
        
        const users = await User.find().lean();
        const userMap = {};
        users.forEach(u => userMap[u._id.toString()] = u);

        const allRequests = allRequestsRaw.map(reqDoc => ({
            ...reqDoc,
            studentId: userMap[reqDoc.studentId?.toString()] || null
        }));
        
        const totalRequests = allRequests.length;
        const departments = ['finance', 'datacell', 'lab', 'cafeteria', 'library', 'photocopier', 'report'];
        
        let deptStats = {};
        departments.forEach(dept => {
            deptStats[dept] = { approved: 0, pending: 0, rejected: 0, notSent: 0 };
        });

        let fullyApprovedCount = 0;

        allRequests.forEach(reqDoc => {
            let isFullyApproved = true;
            departments.forEach(dept => {
                const st = reqDoc.statuses[dept]?.status || 'Not Sent';
                if (st === 'Approved') {
                    deptStats[dept].approved++;
                } else if (st === 'Pending' || st === 'Resubmitted') {
                    deptStats[dept].pending++;
                    isFullyApproved = false;
                } else if (st === 'Rejected') {
                    deptStats[dept].rejected++;
                    isFullyApproved = false;
                } else {
                    deptStats[dept].notSent++;
                    isFullyApproved = false;
                }
            });
            if (isFullyApproved) fullyApprovedCount++;
        });

        res.status(200).json({
            totalRequests,
            fullyApprovedCount,
            inProgressCount: totalRequests - fullyApprovedCount,
            deptStats,
            requests: allRequests
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const startServer = async () => {
    await connectDb();
    app.listen(PORT, () => { 
        console.log(`🚀 Server running on http://localhost:${PORT}`); 
    });
};

startServer();