
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');
const helper = require('./helper.js');

//Form for creating a new puzzle
const PuzzleForm = (props) => {
    const [message, setMessage] = useState(''); //stores messages like success or errors

    const handleSubmit = async (e) => {
        e.preventDefault();

        //get values entered into the form
        const word = e.target.querySelector('#puzzleWord').value;
        const title = e.target.querySelector('#puzzleTitle').value;
        const isPublic = e.target.querySelector('#isPublic').checked;

        //checks that the word contains exactly 5 letters
        if (!/^[A-Za-z]{5}$/.test(word.trim())) {
            setMessage('Please enter exactly five letters.');
            return;
        }

        try {
            //sends new puzzle information to the server
            const response = await fetch('/createPuzzle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    word,
                    isPublic,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Puzzle created successfully!'); //display success message
                e.target.reset();
                props.triggerReload();
            } else {
                setMessage(data.error || 'Could not create puzzle.'); //error message
            }
        } catch (err) {
            setMessage('Could not connect to the server.');
        }
    };

    return (
        <section className="puzzleCreator">
            <h2>Create a Puzzle</h2>
            <p>Enter a five letter word for other players to guess.</p>

            <form onSubmit={handleSubmit}>
                <label htmlFor="puzzleTitle">Puzzle Title:</label>
                <input
                    id="puzzleTitle"
                    type="text"
                    maxLength="50"
                    placeholder="My First Puzzle"
                    required
                />
                <label htmlFor="puzzleWord">Secret Word:</label>
                <input
                    id="puzzleWord"
                    type="text"
                    maxLength="5"
                    placeholder="APPLE"
                    required
                />
                <label htmlFor="isPublic">
                    <input
                        id="isPublic"
                        type="checkbox"
                        defaultChecked
                    />
                    Make this puzzle public
                </label>

                <button type="submit">Create Puzzle</button>
            </form>

            <p>{message}</p>
        </section>
    );
};

//displays all puzzles created by a logged in user
const MyPuzzles = (props) => {
    const [puzzles, setPuzzles] = useState([]);

    //loads puzzles when it first appears or if reloadPuzzles changes
    useEffect(() => {
        const loadPuzzles = async () => {
            try {
                const response = await fetch('/getMyPuzzles');
                const data = await response.json();

                if (response.ok) {
                    setPuzzles(data.puzzles); //updates puzzle list
                }
            } catch (err) {
                console.log(err);
            }
        };

        loadPuzzles();
    }, [props.reloadPuzzles]); //run again when reloadPuzzles changes

    return (
        <section className="myPuzzles">
            <h2>My Puzzles</h2>

            {puzzles.length === 0 ? (
                <p>You haven't created any puzzles yet.</p>
            ) : (
                <div>
                    {puzzles.map((puzzle) => (
                        <div key={puzzle._id} className="puzzleCard">
                            <h3>{puzzle.title || 'Untitled Puzzle'}</h3>
                            <p>Created: {new Date(puzzle.createdAt).toLocaleDateString()}</p>
                            <p>{puzzle.isPublic ? 'Public' : 'Private'}</p>
                            <p>ID: {puzzle._id}</p>

                            <button type="button" onClick={() => props.selectPuzzle(puzzle)}>
                                Play Puzzle
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

//displays guesses for games using specific colors. reused by both custom puzzles and random
const GuessGrid = ({ guesses }) => (
    <div className="guessGrid">
        {guesses.map((item, index) => (
            <div key={index} className="guessRow">
                {item.word.split('').map((letter, i) => ( //split guess into individual letters
                    <span
                        key={i}
                        className={`guessTile ${item.result[i]}`} //so class can be "guessTile correct" so the CSS can be used properly
                    >
                        {letter}
                    </span>
                ))}
            </div>
        ))}
    </div>
);

//input form. reused by both custom puzzles and random
const GuessForm = ({ guess, setGuess, handleGuess, disabled }) => (
    <form onSubmit={handleGuess}>
        <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            maxLength="5"
            placeholder="Enter a guess"
            disabled={disabled}
            required
        />

        <button type="submit" disabled={disabled}>
            Guess
        </button>
    </form>
);


//the actual guessing game
const PuzzleGame = (props) => {
    //creating state variables
    const [guess, setGuess] = useState(''); //current guess
    const [guesses, setGuesses] = useState([]); //all guesses

    const [message, setMessage] = useState('');
    const [gameOver, setGameOver] = useState(false);

    //handling submitted guesses
    const handleGuess = async (e) => {
        e.preventDefault();

        //validates guess
        if (!/^[A-Za-z]{5}$/.test(guess)) {
            setMessage('Please enter exactly five letters');
            return;
        }

        try {
            const response = await fetch('/checkGuess', { //send request to checkGuess
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    puzzleId: props.puzzle._id,
                    guess,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                //array of all guesses
                const newGuesses = [...guesses, { // ... copy elements from existing array into a new array
                    word: guess.toUpperCase(),
                    result: data.result, //adding new guess and results
                }];

                setGuesses(newGuesses);
                setGuess(''); //clear input

                //update message and game over
                if (data.correct) { //if you win
                    setMessage('Congratulations! You guessed the word!');
                    setGameOver(true);
                } else if (newGuesses.length >= 6) { //if you go over 6 guesses
                    setMessage('Game over! You ran out of guesses.');
                    setGameOver(true);
                } else {
                    setMessage('');
                }
            } else {
                setMessage(data.error || 'Error checking guess');
            }
        } catch (err) {
            setMessage('Could not connect to the server.');
        }
    };

//display the game and grid
    return (
        <section className="puzzleGame">
            <h2>{props.puzzle.title || 'Untitled Puzzle'}</h2>
            <p>Guess the five letter word</p>
            <p>Guesses remaining: {6 - guesses.length}</p>
            
            <GuessGrid guesses={guesses} />

            {!gameOver && ( //uses reusable guess form
                <GuessForm
                    guess={guess}
                    setGuess={setGuess}
                    handleGuess={handleGuess}
                    disabled={false}
                />
            )}

            <p>{message}</p>

            <button type="button" onClick={props.returnToList}>
                Back to My Puzzles
            </button>
        </section>
    );
};

//lets users start a random game
const RandomPuzzle = () => {
    //store currently selected game
    const [game, setGame] = useState(null);

    //stores message
    const [message, setMessage] = useState('');
    //current guess
    const [guess, setGuess] = useState('');

    //all guesses and their letter statuses
    const [guesses, setGuesses] = useState([]);

    //stores answer
    const [answer, setAnswer] = useState('');

    //start new random game
    const startGame = async () => {
        try {
            const response = await fetch('/startRandomGame', {
                method: 'POST',
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.error || 'Could not start a game.');
                return;
            }

            //save the game in react state
            setGame(data.game);
            setMessage('');

            //clear the previous game
            setGuess('');
            setGuesses([]);
            setAnswer('');
        } catch (err) {
            setMessage('Error starting random game.');
        }
    };

    //sends guess to the server
    const handleGuess = async (e) => {
        e.preventDefault();

        const wordGuess = guess.trim().toUpperCase();

        //make sure the guess is exactly five letters
        if (!/^[A-Z]{5}$/.test(wordGuess)) {
            setMessage('Please enter exactly five letters.');
            return;
        }

        //prevent guessing if there is no game or it is finished
        if (!game || game.completed) {
            return;
        }

        try {
            const response = await fetch('/checkRandomGuess', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gameId: game._id,
                    guess: wordGuess,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.error || 'Could not check guess.');
                return;
            }

            //add the guess and its colors to the display
            setGuesses((previousGuesses) => [
                ...previousGuesses,
                {
                    word: wordGuess,
                    result: data.result,
                },
            ]);

            //update game
            setGame(data.game);
            setGuess('');

            //display messages
            if (data.correct) {
                setMessage('You guessed the word');
            } else if (data.game.completed) {
                setAnswer(data.answer);
                setMessage('Game over. You used all six guesses.');
            } else {
                setMessage('');
            }
        } catch (err) {
            setMessage('Error checking guess.');
        }
    };


    return (
        <div className="randomPuzzle">
            <h2>Random Word Game</h2>

            <p>Play unlimited randomly generated puzzles</p>

            <button type="button" onClick={startGame}>
                {game ? 'New Random Puzzle' : 'Start Random Puzzle'}
            </button>

            {message && <p>{message}</p>}

            {answer && <p>The correct word was: <strong>{answer}</strong></p>}

            {game && (
                <div>
                    <h3>Random Puzzle</h3>

                    <p>Guesses remaining: {6 - game.guesses.length}</p>

                    <GuessGrid guesses={guesses} />

                    {!game.completed && ( //uses reusable guess form
                        <GuessForm
                            guess={guess}
                            setGuess={setGuess}
                            handleGuess={handleGuess}
                            disabled={false}
                        />
                    )}

                </div>
            )}

        </div>
    );
};
//
const App = () => {
    const [reloadPuzzles, setReloadPuzzles] = useState(false);
    const [selectedPuzzle, setSelectedPuzzle] = useState(null); //stores puzzle user chose
    const [showRandom, setShowRandom] = useState(false);

    return (
        <div>
            <nav>
                <button type="button" onClick={() => {
                    setShowRandom(false);
                    setSelectedPuzzle(null);
                }}>
                    My Puzzles
                </button>

                <button type="button" onClick={() => {
                    setShowRandom(true);
                    setSelectedPuzzle(null);
                }}>
                    Random WordGame
                </button>
            </nav>

            {showRandom ? (
                <RandomPuzzle />
            ) : selectedPuzzle ? (
                <PuzzleGame
                    puzzle={selectedPuzzle}
                    returnToList={() => setSelectedPuzzle(null)}
                />
            ) : (
                <>
                    <PuzzleForm
                        triggerReload={() => setReloadPuzzles(!reloadPuzzles)}
                    />
                    <MyPuzzles
                        reloadPuzzles={reloadPuzzles}
                        selectPuzzle={setSelectedPuzzle}
                    />
                </>
            )}
        </div>
    );
};



const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render(<App />);
};

window.onload = init;
