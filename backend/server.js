const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config(); // Loads environment variables from .env

const User = require('./models/User'); // Imports our database blueprint
const ClearanceRequest=require('./models/ClearanceRequest');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Turns incoming raw JSON data into usable JavaScript objects

// MongoDB Local Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ MongoDB local database connected successfully!"))
    .catch((error) => console.error("❌ Database connection error:", error));

// 1. Handshake Route
app.get('/api/test', (req, res) => {
    res.json({ message: "Backend and Database are both connected successfully!" });
});

// 2. Signup Route
app.post('/api/signup', async (req, res) => {
    try {
        const { name, registeration_no, password, phoneNumber, department } = req.body;

        // Extra check: Ensure a user with this Registration No doesn't already exist
        const existingUser = await User.findOne({ registeration_no });
        if (existingUser) {
            return res.status(400).json({ message: "Registration number is already registered!" });
        }


        // Create a new user matching the Schema structure
        const newUser = new User({
            name,
            registeration_no,
            password, // Stored as plain-text for now to keep things easy to understand
            phoneNumber,
            department
        });

        // Save the user to the local database
        const savedUser = await newUser.save();

        // Send back a success message + the saved user object
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
    //app.post defines http post route that hides sensitive data.
    //'api/login' it's url path that frontend will use to send data.
    //async allows code to pause and wait for database operations without freezing the server.
    //req holds information coming from user.
    //res holds information sent to user.
    try {
        const { registeration_no, password } = req.body; //req.body contains all the infromation sent by user through api request. 
        const user = await User.findOne({ registeration_no });

        if (!user) {
            return res.status(400).json({ message: "invalid registeration or password" });

        }                                               //messages are same for security reason.

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
    catch(error){
        console.error("Login Error:",error);
        res.status(500).json({message:"error during login", error:error.message});
    }
});

app.post('/api/clearance/request', async (req, res) => {
    try {
        // 'req.body.studentId' grabs the student's unique database ID sent from React
        const { studentId } = req.body;

        // Step A: Check if this student already has an active clearance document
        const existingRequest = await ClearanceRequest.findOne({ studentId });
        if (existingRequest) {
            return res.status(400).json({ message: "error: You have already initiated your clearance process!" });
        }

        // Step B: Create a fresh request document based on our ClearanceRequest schema
        // This sets all 7 departments to 'Pending' in one single database write!
        const newRequest = new ClearanceRequest({
            studentId: studentId, // References the student's User ID
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


        // Step C: Save this document inside our local MongoDB database
        const savedRequest = await newRequest.save();

        // Send a 201 Created status back to the client along with the new clearance statuses
        res.status(200).json({
            message: "Clearance process initiated successfully!",
            clearance: savedRequest
        });

    } catch (error) {
        console.error("Initiate Clearance Route Error:", error);
        res.status(500).json({ message: "error: Failed to initiate clearance", error: error.message });
    }
});

// ============================================================================
// 5. FETCH CLEARANCE STATUS ROUTE (Student Checklist Tracker)
// ============================================================================
// 'app.get' is used because we are just querying (reading) data, not modifying it.
app.get('/api/clearance/my-status', async (req, res) => {
    try {
        // For GET requests, we cannot send a hidden body. 
        // We grab parameters out of the URL string (?studentId=XXXX) using 'req.query'
        const { studentId } = req.query;

        // Find the clearance document belonging to this student ID
        const clearance = await ClearanceRequest.findOne({ studentId });

        // If 'clearance' is empty (null), it means they have never clicked "Apply" yet.
        // We return null with a 200 code so the frontend knows to display the "Apply" button.
        if (!clearance) {
            return res.status(200).json({ clearance: null });
        }

        // If found, send the clearance document containing the 7 statuses back to React
        res.status(200).json({ clearance });

    } catch (error) {
        console.error("Fetch Status Route Error:", error);
        res.status(500).json({ message: "error: Failed to fetch clearance status", error: error.message });
    }
});

app.get('/api/clearance/approved',async(req, res)=>{
    try{
        const {departmentRole}=req.query;

        if(!departmentRole||departmentRole==='student'){
            return res.status(403).json({message:"unauthroized access"});
        }

        const dynamicQuery={
            [`statuses.${departmentRole}.status`]:'Approved'
        };

        const approvedStudents=await ClearanceRequest.find(dynamicQuery).populate('studentId','name registeration_no');
        res.status(200).json({requests:approvedStudents});


    }
    catch(error){
        console.error('fetch approved students error',error);
        res.status(500).json({message:'error',error:error.message});
    }
});

app.get('/api/clearance/pending', async (req, res) => {
    try {
        // We grab the department's role from the URL (e.g., ?departmentRole=finance)
        const { departmentRole } = req.query;

        // Security Check: If no role is provided or a student tries to access this, block them.
        if (!departmentRole || departmentRole === 'student') {
            return res.status(403).json({ message: "error: Unauthorized access." });
        }

        // --- CONCEPT: DYNAMIC QUERY KEYS ---
        // We need to check if 'statuses.finance.status' equals 'Pending'.
        // Because the department changes based on who logs in, we use [ `...` ] to create a dynamic key.
        const dynamicQuery = {
            [`statuses.${departmentRole}.status`]: 'Pending'
        };

        // --- CONCEPT: POPULATE (Joining Data) ---
        // 'ClearanceRequest.find(dynamicQuery)' gets all matching requests.
        // '.populate()' tells MongoDB: "Take the 'studentId', go to the User collection, and bring back their name, roll number, department, and phone!"
        const pendingStudents = await ClearanceRequest.find(dynamicQuery)
            .populate('studentId', 'name registeration_no department phoneNumber');

        // Send the populated array of pending students back to the Admin's React screen
        res.status(200).json({ requests: pendingStudents });

    } catch (error) {
        console.error("Fetch Pending Students Error:", error);
        res.status(500).json({ message: "error: Failed to fetch pending students", error: error.message });
    }
});

app.post('/api/clearance/action', async (req, res) => {
    try {
        const { requestId, departmentRole, action, reason } = req.body;

        // Validation Checks
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

        // Apply dynamic clearance updates
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

// CRITICAL: Tell Express to start listening to incoming network requests on Port 5000
app.listen(PORT, () => {
    console.log(`🚀 Server is listening and running on http://localhost:${PORT}`);
});