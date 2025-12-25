const mongoose = require('mongoose');

const recoverySuggestionSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        burnoutLevel: {
            type: String,
            required: true,
        },
        suggestedActions: [
            {
                type: String,
            },
        ],
        createdDate: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const RecoverySuggestion = mongoose.model('RecoverySuggestion', recoverySuggestionSchema);

module.exports = RecoverySuggestion;
