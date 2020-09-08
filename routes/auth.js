const {Router} = require('express');
const router = Router();
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

//Express validator
const {validationResult} = require('express-validator');
//Validation middleware (registration)
const {registerValidator} = require('../middleware/validators');
//Validation middleware (login)
const {loginValidator} = require('../middleware/validators');

//emails setting
const nodemailer = require('nodemailer');
const regEmail = require(path.join(__dirname, '../emails/registration'));
const resetPassword = require(path.join(__dirname, '../emails/reset'));

//Transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
      user: 'beth.stark@ethereal.email',
      pass: '3vYu63tqxqTF3qMvap'
  }
});

//User model
const User = require(path.join(__dirname, '../models/user'));

//Login page render router
router.get('/', async (req, res)=> {
  try {
    res.render('auth/login', {
      title: 'auth page',
      isLogin: true,
      loginError: req.flash('logError'),
      regError: req.flash('regError')
    });
  } catch (error) {
    console.log(error);
  }
});

//Sing in to shop router
router.post('/login', loginValidator, async (req, res) => {
  try {

    const errors = validationResult(req);
    if (!errors.isEmpty()){
      req.flash('logError', errors.array()[0].msg);
      return res.status(422).redirect('/auth#login');
    }

    req.session.user = await User.findOne({email: req.body.email});
    req.session.isAuthenticate = true;
    req.session.save(err => {
      if (err) throw new Error('Session error');
      res.redirect('/');
    });
  } catch (error) {
    console.log(error);
  }
});

//Registration
router.post('/reg', registerValidator, async (req, res) => {
  try {
    const {name, email, password} = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()){
      req.flash('regError', errors.array()[0].msg);
      return res.status(422).redirect('/auth#reg');
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const user = new User({email, name, password: hashPassword, cart: {items: []}});
    await user.save();
    req.session.user = user;
    req.session.isAuthenticate = true;
    await req.session.save();

    res.redirect('/');
    await transporter.sendMail(regEmail(email));
  
  } catch (error) {
    console.log(error);
  }
});

//Exit shop
router.get('/logout', async (req, res) => {
  try {
    req.session.destroy(() => {
      res.redirect('/auth#login');
    });
  } catch (error) {
    console.log(error);
  }
});

//Reset password page render
router.get('/reset', (req, res) => {
  res.render('auth/reset', {
    title: 'Reset password',
    error: req.flash('error')
  });
});

router.post('/reset', (req, res) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        req.flash('error', 'Server error');
        return res.render('/auth/reset');
      }

      const token = buffer.toString('hex'); //(460899d9539bde6864d93780bee535574f1fca68490b9c45670a93023d09cbaf)

      const condidate = await User.findOne({email: req.body.email});

      if (condidate){
        condidate.resetToken = token;
        condidate.resetTokenExp = Date.now() + 60 * 60 * 1000; //час жизни токена
        await condidate.save();
        await transporter.sendMail(resetPassword(condidate.email, token));
        res.redirect('/auth');
      } else {
        req.flash('error', 'Not this email');
        res.redirect('/auth/reset');
      }
    });
  } catch (error) {
    console.log(error);
  }
});

//New password page render
router.get('/password/:token', async (req, res) => {
  try {
    if (!req.params.token){
      return res.redirect('/auth');
    }

    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExp: {$gt: Date.now()}
    });

    if (!user) {
      return res.redirect('/auth');
    } else {
      res.render('auth/password', {
        title: 'Password update',
        error: req.flash('error'),
        userId: user._id.toString(),
        token: req.params.token
      });
    }
  } catch (error) {
    console.log(error);
  }
});

//New update password post
router.post('/password', async (req, res) => {
  try {
    const {id, password, token} = req.body;

    const user = await User.findOne({
      _id: id,
      resetToken: token,
      resetTokenExp: {$gt: Date.now()}
    });

    if (user){
      user.password = await bcrypt.hash(password, 10);
      user.resetToken = undefined;
      user.resetTokenExp = undefined;
      await user.save();

      res.redirect('/auth');
    } else {
      req.flash('error', 'Token time experation is over');
      req.redirect('/auth');
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;