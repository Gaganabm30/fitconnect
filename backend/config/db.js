const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Debug log to verify if env var is loaded (masking part of it for security)
        const uri = process.env.MONGO_URI;
        console.log(`Connecting to MongoDB... URI loaded: ${uri ? 'Yes' : 'No'}`);
        if (uri) {
            console.log(`URI starts with: ${uri.substring(0, 15)}...`);
        }

        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
