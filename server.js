const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./db');  // Import your db.js file for DB connection
const User = require('./models/User'); // Import the User model

const app = express();
const port = 5000;

// Middleware
app.use(express.json());  // To parse incoming JSON requests
app.use(cors());  // To allow cross-origin requests

// Connect to MongoDB (calls the connectDB function from db.js)
connectDB();

// Root Route for Testing
app.get('/', (req, res) => {
    res.send('Welcome to the Backend!');
});

// Signup Route
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'Please fill all fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const newUser = new User({ username, email, password });
    try {
        await newUser.save();
        res.status(201).json({ success: true, message: 'Signup successful' });
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).json({ success: false, message: 'Error saving user' });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please fill all fields' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        res.json({ success: true, message: 'Login successful' });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, message: 'Error during login' });
    }
});

// ViewAll Route to Fetch All Users
app.get('/viewall', async (req, res) => {
    try {
        const users = await User.find({}, 'username email');  // Fetch only username and email fields
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'No users found' });
        }
        res.json({ success: true, data: users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Error fetching users' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
