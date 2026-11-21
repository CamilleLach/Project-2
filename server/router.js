
const controllers = require('./controllers');
const mid = require('./middleware');

//added about page
const router = (app) => {
    app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
    app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

    app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

    app.get('/logout', mid.requiresLogin, controllers.Account.logout);

    //havent removed domo stuff yet
    app.get('/maker', mid.requiresLogin, controllers.Domo.makerPage);
    app.post('/maker', mid.requiresLogin, controllers.Domo.makeDomo);
    app.get('/getDomos', mid.requiresLogin, controllers.Domo.getDomos);

    //puzzle
    app.post('/createPuzzle', mid.requiresLogin, controllers.Puzzle.createPuzzle);
    app.get('/getMyPuzzles', mid.requiresLogin, controllers.Puzzle.getMyPuzzles);
    app.post('/checkGuess', mid.requiresLogin, controllers.Puzzle.checkGuess);
    //random game
    app.post('/startRandomGame', mid.requiresLogin, controllers.Game.startRandomGame);
    app.post('/checkRandomGuess', mid.requiresLogin, controllers.Game.checkRandomGuess);

    app.get('/about', mid.requiresLogin, controllers.Domo.aboutPage);

    app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;


