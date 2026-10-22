require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const mysql = require("mysql2/promise");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(__dirname));

// Serve home.html at root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

// Verify MySQL connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Connected to MySQL successfully!");
    connection.release();
  } catch (err) {
    console.error("MySQL connection failed:", err.message);
  }
})();

app.post("/register", async (req, res) => {
  try {
    const {
      name,
      password,
      age,
      mobile,
      email,
      gender,
      state,
      skills,
    } = req.body;

    const skillsText = Array.isArray(skills)
      ? skills.join(", ")
      : skills || "";

    const query = `
      INSERT INTO users
      (name, password, age, mobile, email, gender, state, skills)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      name,
      password,
      age ? Number(age) : null,
      mobile,
      email,
      gender,
      state,
      skillsText,
    ];

    const [result] = await pool.execute(query, values);

    res.json({
      message: "Registration successful",
      insertedId: result.insertId,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});