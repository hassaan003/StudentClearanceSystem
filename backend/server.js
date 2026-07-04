const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const ClearanceRequest = require('./models/ClearanceRequest');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ MongoDB local database connected successfully!"))
    .catch((error) => console.error("❌ Database connection error:", error));

app.get('/api/test', (req, res) => {
    res.json({ message: "Backend and Database are both connected successfully!" });
});

app.post('/api/signup', async (req, res) => {
    try {
        const { name, registeration_no, password, phoneNumber, department } = req.body;

        const existingUser = await User.findOne({ registeration_no });
        if (existingUser) {
            return res.status(400).json({ message: "Registration number is already registered!" });
        }

        const newUser = new User({
            name,
            registeration_no,
            password,
            phoneNumber,
            department
        });

        const savedUser = await newUser.save();

        res.status(201).json({
            message: "User registered successfully!",
            user: savedUser
        });

    } catch (error) {
        console.error("Signup Route Error:", error);
        res.status(500).json({ message: "Server error during registration", error: error.message });
    }
});

app.post('/api/login', async (req, res) => {

    try {
        const { registeration_no, password } = req.body;
        const user = await User.findOne({ registeration_no });

        if (!user) {
            return res.status(400).json({ message: "invalid registeration or password" });

        }

        if (user.password !== password) {
            return res.status(400).json({ message: "invalid registeration or password" });

        }

        res.status(200).json({
            message: "login Successful",
            user: {
                id: user._id,
                name: user.name,
                registeration_no: user.registeration_no,
                role: user.role,
                department: user.department
            }
        });

    }
    catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "error during login", error: error.message });
    }
});

app.post('/api/clearance/request', async (req, res) => {
    try {
        const { studentId } = req.body;

        const existingRequest = await ClearanceRequest.findOne({ studentId });
        if (existingRequest) {
            return res.status(400).json({ message: "error: You have already initiated your clearance process!" });
        }


        const newRequest = new ClearanceRequest({
            studentId: studentId,
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

        res.status(200).json({
            message: "Clearance process initiated successfully!",
            clearance: savedRequest
        });

    } catch (error) {
        console.error("Initiate Clearance Route Error:", error);
        res.status(500).json({ message: "error: Failed to initiate clearance", error: error.message });
    }
});


app.get('/api/clearance/my-status', async (req, res) => {
    try {

        const { studentId } = req.query;

        const clearance = await ClearanceRequest.findOne({ studentId });


        if (!clearance) {
            return res.status(200).json({ clearance: null });
        }

        res.status(200).json({ clearance });

    } catch (error) {
        console.error("Fetch Status Route Error:", error);
        res.status(500).json({ message: "error: Failed to fetch clearance status", error: error.message });
    }
});

app.get('/api/clearance/approved', async (req, res) => {
    try {
        const { departmentRole } = req.query;

        if (!departmentRole || departmentRole === 'student') {
            return res.status(403).json({ message: "unauthroized access" });
        }

        const dynamicQuery = {
            [`statuses.${departmentRole}.status`]: 'Approved'
        };

        const approvedStudents = await ClearanceRequest.find(dynamicQuery).populate('studentId', 'name registeration_no');
        res.status(200).json({ requests: approvedStudents });


    }
    catch (error) {
        console.error('fetch approved students error', error);
        res.status(500).json({ message: 'error', error: error.message });
    }
});

app.get('/api/clearance/pending', async (req, res) => {
    try {
        const { departmentRole } = req.query;

        if (!departmentRole || departmentRole === 'student') {
            return res.status(403).json({ message: "error: Unauthorized access." });
        }


        const dynamicQuery = {
            [`statuses.${departmentRole}.status`]: 'Pending'
        };


        const pendingStudents = await ClearanceRequest.find(dynamicQuery)
            .populate('studentId', 'name registeration_no department phoneNumber');

        res.status(200).json({ requests: pendingStudents });

    } catch (error) {
        console.error("Fetch Pending Students Error:", error);
        res.status(500).json({ message: "error: Failed to fetch pending students", error: error.message });
    }
});

app.post('/api/clearance/action', async (req, res) => {
    try {
        const { requestId, departmentRole, action, reason } = req.body;

        if (!requestId || !departmentRole || !action) {
            return res.status(400).json({ message: "error: Missing required parameters." });
        }

        if (!['Approved', 'Rejected'].includes(action)) {
            return res.status(400).json({ message: "error: Invalid status action." });
        }

        const request = await ClearanceRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: "error: Clearance request document not found." });
        }

        request.statuses[departmentRole].status = action;
        request.statuses[departmentRole].reason = action === 'Rejected' ? (reason || '') : '';

        const updatedRequest = await request.save();

        res.status(200).json({
            message: `Clearance successfully updated to ${action}!`,
            clearance: updatedRequest
        });

    } catch (error) {
        console.error("Process Action Route Error:", error);
        res.status(500).json({ message: "error: Failed to process action", error: error.message });
    }
});

app.get('/api/clearance/rejected', async(req,res)=>{
    try{
        const {departmentRole}=req.query;
        if(!departmentRole||departmentRole==='student'){
            return res.status(403).json({message:"error:unauthroized access"});
        }
        const dynamicQuery={
            [`statuses.${departmentRole}.status`]:{$in:['Rejected','Resubmitted']}
        };

        const rejectedRequests=await ClearanceRequest.find(dynamicQuery)
        .populate('studentId','name registeration_no department phoneNumber');
        res.status(200).json({requests:rejectedRequests});
    }
    catch(error){
        console.error("fetching rejected requests error", error);
        res.status(500).json({message:"error", error:error.message});
    }
});
app.post('/api/clearance/resubmit', async (req, res) => {
    try {
        const { studentId, departmentRole } = req.body;

        if (!studentId || !departmentRole) {
            return res.status(400).json({ message: "error: Missing required parameters." });
        }

        const request = await ClearanceRequest.findOne({ studentId });
        if (!request) {
            return res.status(404).json({ message: "error: Request document not found." });
        }

        // Update target department status to 'Resubmitted' and reset previous rejection reason
        request.statuses[departmentRole].status = 'Resubmitted';
        request.statuses[departmentRole].reason = '';

        const updatedRequest = await request.save();

        res.status(200).json({
            message: `Clearance request successfully resubmitted to ${departmentRole.toUpperCase()}!`,
            clearance: updatedRequest
        });

    } catch (error) {
        console.error("Resubmission Route Error:", error);
        res.status(500).json({ message: "error: Failed to resubmit request", error: error.message });
    }
});
app.get('/api/clearance/resubmitted', async (req, res) => {
    try {
        const { departmentRole } = req.query;

        if (!departmentRole || departmentRole === 'student') {
            return res.status(403).json({ message: "error: Unauthorized access." });
        }

        // Search database specifically for requests marked as 'Resubmitted' for this department
        const dynamicQuery = {
            [`statuses.${departmentRole}.status`]: 'Resubmitted'
        };

        const resubmittedRequests = await ClearanceRequest.find(dynamicQuery)
            .populate('studentId', 'name registeration_no department phoneNumber');

        res.status(200).json({ requests: resubmittedRequests });

    } catch (error) {
        console.error("Fetch Resubmitted Requests Error:", error);
        res.status(500).json({ message: "error: Failed to fetch resubmitted requests", error: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`🚀 Server is listening and running on http://localhost:${PORT}`);
});