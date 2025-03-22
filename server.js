require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "testuser", // Your MySQL username
    password: "testpassword", // Your MySQL password
    database: "edutou_supermarket",
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed: ", err);
    } else {
        console.log("Connected to MySQL Database ✅");
    }
});

// 🔹 User Registration (Signup)
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
    db.query(sql, [username, hashedPassword], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error registering user" });
        }
        res.json({ success: true, message: "User registered successfully!" });
    });
});

// 🔹 User Login
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT * FROM users WHERE username = ?";
    db.query(sql, [username], async (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Database error" });
        }
        if (result.length === 0) {
            return res.status(401).json({ message: "User not found" });
        }

        // Compare passwords
        const user = result[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT Token
        const token = jwt.sign({ userId: user.id }, "your_secret_key", { expiresIn: "1h" });

        res.json({ success: true, message: "Login successful!", token });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
