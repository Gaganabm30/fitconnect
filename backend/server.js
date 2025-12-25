const dotenv = require('dotenv');
// Load env vars BEFORE imports that might use them
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
connectDB();

// Routes Placeholder
app.get('/', (req, res) => {
  res.send('Fitness Tracker API is running...');
});

// Import Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/workouts', require('./routes/workoutRoutes'));
app.use('/api/nutrition', require('./routes/nutritionRoutes'));
app.use('/api/goals', require('./routes/goalRoutes'));
app.use('/api/social', require('./routes/socialRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/challenges', require('./routes/challengeRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/burnout', require('./routes/burnoutRoutes'));

// Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
