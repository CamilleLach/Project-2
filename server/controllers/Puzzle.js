
const models = require('../models');
const mongoose = require('mongoose');

const { Puzzle } = models;
const { checkWord } = require('../wordleLogic');


//gets all puzzles from logged in user
const getMyPuzzles = async (req, res) => {
    const query = { owner: req.session.account._id };

    try {
        //using select so the word isn't included, so users can't cheat by inspecting and looking at the data
        const docs = await Puzzle.find(query).select('title isPublic createdAt').lean().exec();

        return res.json({ puzzles: docs });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error retrieving puzzles!' });
    }
};

//check puzzle guesses
const checkGuess = async (req, res) => {
    const { puzzleId, guess } = req.body;

    //check validity
    if (!puzzleId || !guess || typeof guess !== 'string') {
        return res.status(400).json({ error: 'Puzzle ID and guess are required' });
    }

    const wordGuess = guess.trim().toUpperCase(); //trim and make all uppercase

    //check if it contains exactly 5 letters
    if (!/^[A-Z]{5}$/.test(wordGuess)) {
        return res.status(400).json({ error: 'Guess must contain exactly five letters' });
    }

    if (!mongoose.isValidObjectId(puzzleId)) {
        return res.status(400).json({ error: 'Invalid puzzle ID' });
    }

    try {
        const puzzle = await Puzzle.findById(puzzleId).exec(); //find puzzle with matching ID

        //if theres no puzzle with that id, return 404 not found
        if (!puzzle) {
            return res.status(404).json({ error: 'Puzzle not found!' });
        }

        //checks whether the puzzle belongs to the user logged in or the puzzle is public
        if (!puzzle.isPublic && puzzle.owner.toString() !== req.session.account._id.toString()) {
            return res.status(403).json({ error: 'You cannot play this puzzle!' });
        }

        const answer = puzzle.word;
        
        const result = checkWord(wordGuess, answer); //use reusable function

        //send response
        return res.json({
            result,
            correct: wordGuess === answer,
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error checking guess!' });
    }
};


//creates a 5 letter word puzzle
const createPuzzle = async (req, res) => {
    if (!req.body.word || typeof req.body.word !== 'string') {
        return res.status(400).json({ error: 'A five letter word is required.' });
    }

    const word = req.body.word.trim().toUpperCase(); //all uppercase

    //test if the word is exactly 5 letters long and contains only uppercase letters
    if (!/^[A-Z]{5}$/.test(word)) {
        return res.status(400).json({
            error: 'The word must contain exactly five letters.',
        });
    }
    //title validation
    if (typeof req.body.title !== 'string'
        || !req.body.title.trim()
        || req.body.title.trim().length > 50) {
        return res.status(400).json({ error: 'Please enter a title of 1-50 characters!' });
    }
    const puzzleData = {
        title: req.body.title,
        word,
        owner: req.session.account._id,
        isPublic: req.body.isPublic !== false && req.body.isPublic !== 'false',
    };

    //create puzzle
    try {
        const newPuzzle = new Puzzle(puzzleData);
        await newPuzzle.save();

        return res.status(201).json({
            message: 'Puzzle created successfully!',
            puzzle: Puzzle.toAPI(newPuzzle), //call to api function to create a new object without word field
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            error: 'An error occurred while creating the puzzle.',
        });
    }
};

module.exports = {
    createPuzzle,
    getMyPuzzles,
    checkGuess,
};
