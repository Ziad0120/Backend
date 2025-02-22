const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
       origin: '*', // أو الرابط الذي يعمل عليه الواجهة الأمامية
       methods: ['GET', 'POST', 'PUT', 'DELETE'],
       allowedHeaders: ['Content-Type', 'Authorization'],
     }));
app.use(bodyParser.json());

// الاتصال بقاعدة البيانات MongoDB Atlas
const uri = "هنا هتحط الرابط الكبير دا";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });
// تعريف نموذج المستخدم
const userSchema = new mongoose.Schema({
  name: String,
  password: Number,
  details: [{
    exam: String,
    points: Number,
    total: Number,
  }],
});

const User = mongoose.model('User', userSchema);
app.get('/', (req, res) => {
       res.send('Welcome to the API!');
     });
// API Routes

// الحصول على جميع المستخدمين
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ password: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// إضافة مستخدم جديد
app.post('/api/users', async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({ message: "Name and password are required" });
  }

  const user = new User({
    name,
    password,
    details: [],
  });

  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// تعديل مستخدم
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, password } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (password) user.password = password;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// حذف مستخدم
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// إضافة تفاصيل للمستخدم
app.post('/api/users/:id/details', async (req, res) => {
  const { id } = req.params;
  const { exam, points, total } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.details.push({ exam, points, total });
    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// تعديل تفاصيل المستخدم
app.put('/api/users/:userId/details/:detailId', async (req, res) => {
  const { userId, detailId } = req.params;
  const { exam, points, total } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const detail = user.details.id(detailId);
    if (!detail) {
      return res.status(404).json({ message: "Detail not found" });
    }

    if (exam) detail.exam = exam;
    if (points) detail.points = points;
    if (total) detail.total = total;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// حذف تفاصيل المستخدم
app.delete('/api/users/:userId/details/:detailId', async (req, res) => {
  const { userId, detailId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.details.id(detailId).remove();
    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// بدء الخادم
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
