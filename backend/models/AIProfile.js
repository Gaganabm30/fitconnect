const mongoose = require('mongoose');

const aiProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    age: { type: Number, required: true },
    height: { type: Number, required: true }, // cm
    weight: { type: Number, required: true }, // kg
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    fitnessLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
    goal: { type: String, enum: ['Weight Loss', 'Muscle Gain', 'Endurance', 'Maintenance'], required: true },
    dietaryPreference: { type: String, enum: ['Veg', 'Non-Veg', 'Vegan', 'Pescatarian'], default: 'Non-Veg' },
    daysPerWeek: { type: Number, max: 7, min: 1, default: 4 },
}, {
    timestamps: true
});

module.exports = mongoose.model('AIProfile', aiProfileSchema);
