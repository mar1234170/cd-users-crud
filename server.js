require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// ---------- Model ----------
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  age: { type: Number, required: true, min: 0 },
  city: { type: String, required: true, trim: true },
});
const User = mongoose.model("User", userSchema);

// ---------- Helpers ----------
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ---------- Routes ----------

// 1) POST: add users (accepts one object or an array of 5 users)
app.post("/users", async (req, res) => {
  try {
    const body = Array.isArray(req.body) ? req.body : [req.body];
    const users = await User.insertMany(body);
    res.status(201).json(users);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 2) GET: all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3) GET by ID
app.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: "Invalid ID" });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4) PATCH: update user by ID
app.patch("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: "Invalid ID" });

    const user = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 5) DELETE: delete user by ID
app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: "Invalid ID" });

    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully", deletedUser: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Start ----------
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/usersdb";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
