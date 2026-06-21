// backend/seed.js
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User'); // Import the User model blueprint

// Define the 7 department head accounts
const departmentAccounts = [
    {
        name: "Finance Department In-charge",
        registeration_no: "FIN-DEPT",
        password: "finance123", // Keeping it simple for the FYP demo
        phoneNumber: "03001112223",
        department: "Finance",
        role: "finance"
    },
    {
        name: "Datacell Department In-charge",
        registeration_no: "DC-DEPT",
        password: "datacell123",
        phoneNumber: "03004445556",
        department: "Datacell",
        role: "datacell"
    },
    {
        name: "Lab Department In-charge",
        registeration_no: "LAB-DEPT",
        password: "lab123",
        phoneNumber: "03007778889",
        department: "Labs",
        role: "lab"
    },
    {
        name: "Cafeteria Department In-charge",
        registeration_no: "CAFE-DEPT",
        password: "cafeteria123",
        phoneNumber: "03009990001",
        department: "Cafeteria",
        role: "cafeteria"
    },
    {
        name: "Library Department In-charge",
        registeration_no: "LIB-DEPT",
        password: "library123",
        phoneNumber: "03002223334",
        department: "Library",
        role: "library"
    },
    {
        name: "Photocopier Department In-charge",
        registeration_no: "PHOTO-DEPT",
        password: "copier123",
        phoneNumber: "03005556667",
        department: "Photocopier",
        role: "photocopier"
    },
    {
        name: "Report Department In-charge",
        registeration_no: "REP-DEPT",
        password: "report123",
        phoneNumber: "03008889990",
        department: "FYP Committee",
        role: "report"
    }
];

async function seedDatabase() {
    try {
        // 1. Connect to the local MongoDB database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("连接成功... Connected to MongoDB for seeding.");

        // 2. Delete any old department entries to avoid duplicate keys error
        // This keeps student accounts safe and only wipes roles that are NOT 'student'
        await User.deleteMany({ role: { $ne: 'student' } });
        console.log("🧹 Old department data cleared successfully.");

        // 3. Insert the 7 fresh department accounts
        await User.insertMany(departmentAccounts);
        console.log("🌱 7 Department accounts seeded successfully into MongoDB!");

        // 4. Close the database connection since the task is finished
        mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
}

// Run the function
seedDatabase();
