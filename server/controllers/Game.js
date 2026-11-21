const models = require('../models');
const wordList = require('../wordList');
const { checkWord } = require('../wordleLogic');
const mongoose = require('mongoose');

const { Game } = models;


//starts a new random game. selects a random word and saves it to MongoDB
const startRandomGame = async (req, res) => {
    //selects a random word from the word list
    const randomIndex = Math.floor(Math.random() * wordList.length);
    const word = wordList[randomIndex];

    //creates the data for a new game
    const gameData = {
        player: req.session.account._id,
        word,
        guesses: [],
        completed: false,
        won: false,
    };

    try {
        //creates and saves new game in MongoDB
        const newGame = new Game(gameData);
        await newGame.save();

        //returns game information without showing the word
        return res.status(201).json({
            message: 'Random game started!',
            game: Game.toAPI(newGame),
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            error: 'An error occurred while starting the game.',
        });
    }
};


//checks guesses for current game and saves to MongoDB
const checkRandomGuess = async (req, res) => {
    const { gameId, guess } = req.body;

    //check validity
    if (!gameId || !guess || typeof guess !== 'string') {
        return res.status(400).json({ error: 'Game ID and guess are required' });
    }

    const wordGuess = guess.trim().toUpperCase(); // Trim and make uppercase

    //check if it contains exactly 5 letters
    if (!/^[A-Z]{5}$/.test(wordGuess)) {
        return res.status(400).json({ error: 'Guess must contain exactly five letters' });
    }

    if (!mongoose.isValidObjectId(gameId)) {
        return res.status(400).json({ error: 'Invalid game ID' });
    }

    try {
        //find the game
        const game = await Game.findOne({
            _id: gameId,
            player: req.session.account._id,
        }).exec();

        //return 404 if not found
        if (!game) {
            return res.status(404).json({ error: 'Game not found!' });
        }

        //if the game is done then prevent guessing
        if (game.completed || game.guesses.length >= 6) {
            return res.status(400).json({ error: 'This game is already finished!' });
        }

        const answer = game.word;

        //use the reusable function to check guess
        const result = checkWord(wordGuess, answer);
        const correct = wordGuess === answer;

        //add the guess to the array on MongoDB
        game.guesses.push(wordGuess);

        //end the game if the player wins or runs out of guesses
        if (correct || game.guesses.length >= 6) {
            game.completed = true;
            game.won = correct;
        }

        //save the updated game to MongoDB
        await game.save();

        //send the result without revealing the word
        return res.json({
            result,
            correct,
            game: Game.toAPI(game),
            answer: game.completed && !game.won ? game.word : undefined, //if you lose, reveal word
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error checking random guess!' });
    }
};

module.exports = {
    startRandomGame,
    checkRandomGuess,
};
