//created a seperate reusable function for checking guesses

const checkWord = (wordGuess, answer) => {
    const result = Array(5).fill('absent'); //create an array starting with all letters being absent
    const remainingLetters = {};

    //first find letters in correct positions. loop runs 5 times, once for each letter
    for (let i = 0; i < 5; i++) {
        if (wordGuess[i] === answer[i]) {
            result[i] = 'correct'; //change value to correct instead of absent
        } else {
            const letter = answer[i];
            remainingLetters[letter] = (remainingLetters[letter] || 0) + 1; //update remaining letters
        }
    }

    //now find letters in wrong positions. uses two loops to account for duplicate letters
    for (let i = 0; i < 5; i++) {
        if (result[i] !== 'correct') {
            const letter = wordGuess[i];

            if (remainingLetters[letter] > 0) { //if remaining letters contains more than 0 of that letter, then it is present somewhere in the word
                result[i] = 'present'; //change value to present instead of absent
                remainingLetters[letter]--; //decreases remaining letters
            }
        }
    }

    return result;
};

module.exports = { checkWord };

