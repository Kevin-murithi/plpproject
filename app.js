// Import necessary modules
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const session = require('express-session');
const cors = require('cors');
const path = require('path')

// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();

// Middleware
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

app.use(cors());
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',  // Session secret for managing sessions
    resave: false,
    saveUninitialized: true
}));

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Connect to MySQL database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the MySQL database');
    }
});

// Create 'users' table if it doesn't exist
const createUsersTable = `
    CREATE TABLE IF NOT EXISTS Users (
    user_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NULL,
    password VARCHAR(100) NULL,
    email VARCHAR(100) NULL
);
`;
db.query(createUsersTable, (err) => {
    if (err) {
        console.error('Error creating users table:', err.message);
    } else {
        console.log('Users table created or already exists.');
    }
});

// Create 'food_listings' table if it doesn't exist
const createFoodListingsTable = `
    CREATE TABLE IF NOT EXISTS food_listings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        amount INT NOT NULL,
        location VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;
db.query(createFoodListingsTable, (err) => {
    if (err) {
        console.error('Error creating food listings table:', err.message);
    } else {
        console.log('Food listings table created or already exists.');
    }
});

// =======================
// Authentication Endpoints
// =======================

// Handle user registration (POST /register)
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check for missing fields
        if (!username || !email || !password) {
            return res.status(400).send('All fields are required');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // SQL query to insert the new user
        const sql = 'INSERT INTO Users (username, email, password) VALUES (?, ?, ?)';
        const values = [username, email, hashedPassword];

        // Insert the user into the database
        await db.promise().query(sql, values);
        res.redirect('login.html');
    } catch (error) {
        console.error("Error during registration:", error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Handle user login (POST /api/users/login)
app.post('/api/users/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required' });
        }

        const sql = 'SELECT * FROM Users WHERE username = ?';
        const [results] = await db.promise().query(sql, [username]);

        if (results.length > 0) {
            const match = await bcrypt.compare(password, results[0].password);
            if (match) {
                req.session.user_id = results[0].user_id;
                res.json({ success: true });
            } else {
                res.status(401).json({ success: false, message: 'Invalid Username or Password!' });
            }
        } else {
            res.status(401).json({ success: false, message: 'Invalid Username or Password!' });
        }
    } catch (error) {
        console.error("Error during login:", error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
    if (req.session.user_id) {
        next();
    } else {
        res.status(401).send("Unauthorized access, please log in.");
    }
}

// Get logged-in user profile
app.get('/api/users/profile', (req, res) => {
    if (!req.session.user_id) {
        return res.status(401).json({ message: 'Not logged in' });
    }

    const user_id = req.session.user_id;
    db.query('SELECT username, email FROM users WHERE user_id = ?', [user_id], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(results[0]);
    });
});

// =======================
// Food Listing Endpoints
// =======================

// Create a new food listing
app.post('/api/food/create', (req, res) => {
    const { name, amount, location } = req.body;

    if (!name || !amount || !location) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    db.query('INSERT INTO food_listings (name, amount, location) VALUES (?, ?, ?)', [name, amount, location], (err) => {
        if (err) {
            return res.status(500).json({ message: 'Error creating food listing', error: err.message });
        }
        res.status(201).json({ message: 'Food listing created successfully' });
    });
});

// Get all food listings
app.get('/api/food/listings', (req, res) => {
    const query = 'SELECT * FROM food_listings ORDER BY created_at DESC';
    
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching food listings', error: err.message });
        }
        res.status(200).json(results);
    });
});

// Get a single food listing by ID
app.get('/api/food/listings/:id', (req, res) => {
    const listingId = req.params.id;

    db.query('SELECT * FROM food_listings WHERE id = ?', [listingId], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ message: 'Food listing not found' });
        }
        res.status(200).json(results[0]);
    });
});

// Serve the index page (GET /)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Serve the home page if the user is authenticated (GET /home)
app.get('/home', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/dashboard.html'));
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));


// =======================
// Start the Server
// =======================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
