# Fitness Tracker MERN

A modern MERN stack fitness tracking application.

## Features
- **Authentication**: Secure Login/Signup with JWT.
- **Dashboard**: Daily summary of calories, workouts, etc.
- **Workouts**: Log cardio, strength, yoga sessions.
- **Nutrition**: Track meals and macros.
- **Goals**: Set weight and fitness targets.
- **Social**: Friend system and Leaderboard.
- **Responsive UI**: Clean design with Dark Mode support (system default or css class).

## Tech Stack
- **Frontend**: React, React Router, Axios, CSS Variables.
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT.

## Setup

### Prerequisites
- Node.js
- MongoDB (Running locally or Atlas URI)

### Installation

1. **Clone the repository** (if applicable)

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Variables**
   Create `backend/.env` file:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/fitness-tracker
   JWT_SECRET=your_jwt_secret
   ```

### Running the App

1. **Start Backend**
   ```bash
   cd backend
   npm run dev (or npx nodemon server.js)
   ```

2. **Start Frontend**
   ```bash
   cd frontend
   npm start
   ```

3. Open `http://localhost:3000` in your browser.

## Screenshots
(Add screenshots here)
