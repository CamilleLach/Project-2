const Domo = require('../models/Domo.js');


const makerPage = (req, res) => res.render('app');
const aboutPage = (req, res) => res.render('about');


const getDomos = async (req, res) => {
    const query = { owner: req.session.account._id };

    try {
        const docs = await Domo.find(query).select('name age color').lean().exec(); //added color

        return res.json({ domos: docs });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error retrieving domos!' });
    }
};


//added color
const makeDomo = async (req, res) => {
    if (!req.body.name || !req.body.age || !req.body.color) {
        return res.status(400).json({ error: 'All fields are required!' });
    }

    const domoData = {
        name: req.body.name,
        age: req.body.age,
        color: req.body.color,
        owner: req.session.account._id,
    };

    try {
        const newDomo = new Domo(domoData);
        await newDomo.save();

        return res.status(201).json({
            name: newDomo.name,
            age: newDomo.age,
            color: newDomo.color,
        });
    } catch (err) {
        console.log(err);

        if (err.code === 11000) {
            return res.status(400).json({
                error: 'Domo already exists!',
            });
        }

        return res.status(500).json({
            error: 'An error occurred making domo!',
        });
    }
};


module.exports = {
    makerPage,
    makeDomo,
    getDomos,
    aboutPage,
};
