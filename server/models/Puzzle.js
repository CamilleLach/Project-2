
const mongoose = require('mongoose');

const setWord = (word) => word.trim().toUpperCase();

//schema
const PuzzleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50,
    },
    word: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        minlength: 5,
        maxlength: 5,
        match: /^[A-Z]{5}$/,
        set: setWord,
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Account',
    },

    isPublic: {
        type: Boolean,
        default: true,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

//object that leaves out the hidden word
PuzzleSchema.statics.toAPI = (doc) => ({
    _id: doc._id,
    title: doc.title,
    isPublic: doc.isPublic,
    createdAt: doc.createdAt,
});

const PuzzleModel = mongoose.model('Puzzle', PuzzleSchema);

module.exports = PuzzleModel;
