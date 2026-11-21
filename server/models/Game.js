
const mongoose = require('mongoose');

//schema for storing a players random game
const GameSchema = new mongoose.Schema({
    //the account playing
    player: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Account',
    },
    //the word
    word: {
        type: String,
        required: true,
        uppercase: true,
        minlength: 5,
        maxlength: 5,
    },

    //stores guesses
    guesses: {
        type: [String],
        default: [],
    },

    //whether the game is done
    completed: {
        type: Boolean,
        default: false,
    },

    //whether they won
    won: {
        type: Boolean,
        default: false,
    },

    //When it was created
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

//converts game document into data that can be sent to React
//doesn't include the word intentionally
GameSchema.statics.toAPI = (doc) => ({
    _id: doc._id,
    guesses: doc.guesses,
    completed: doc.completed,
    won: doc.won,
    createdAt: doc.createdAt,
});

const GameModel = mongoose.model('Game', GameSchema);

module.exports = GameModel;
