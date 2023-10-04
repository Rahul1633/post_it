const {User} = require('../../models/schema');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const express = require('express');
const router = express.Router();


const JWT = process.env.JWT;

const maxAge= 3* 24* 60* 60;


const handleErrors = (err) =>{
    console.log(err.message, err.code);
    let errors = { email: '', password: ''};

    if(err.message === 'Incorrect Email') {
        errors.email = 'this email is not registered';
    }

    if(err.message === 'Incorrect Password') {
        errors.email = 'this password is incorrect';
    }

    if(err.code === 11000) {
        errors.email = 'this email is already registered';
        return errors;
    }

    // validation errors
    if(err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message;
        });
    }

    return errors;
}

// JWT token creation
const createToken = (id) => {
    return jwt.sign({id}, JWT, {
        expiresIn: maxAge
    });
};


router.get( '/register' , (req, res) => {
    res.render('register')
});

router.get( '/login', (req, res) => {
    res.render('login')
});

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const user = await User.create({ name, email, password });
        const token = createToken(user._id);
        // Send user data in the response
        res.status(200).json({ user });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json(errors);
    }
});


router.post('/login', async (req, res) => {
    const {email, password} = req.body;

    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000});
        res.status(200).json({user: user._id});
    } catch(err) {
        const errors = handleErrors(err);
        res.status(400).json({errors:errors});
    }
});

// logout
router.get('/logout',(req, res)=>{
    res.clearCookie("jwt");
    res.redirect('user/login');
})




module.exports = router;
