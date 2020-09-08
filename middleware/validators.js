const {body} = require('express-validator');
const bcrypt = require('bcryptjs');

//User model
const User = require('../models/user');

// body('field', message) - req.body
// isAlphanumeric - цифры + буквы
// withMessage(message) - сообщение об ошибке
// custom - кастомный валидатор
// custom (async (value, {req} => {})) - асинхронный валидатор

exports.registerValidator = [
  body('email')
    .isEmail()
    .withMessage('Enter email')
    .custom(async (value, {req}) => {
      try {
        const user = await User.findOne({email: value});
        if (user){
          return Promise.reject('Email is registred');
        }
      } catch (error) {
        console.log(error);
      }
    })
    .normalizeEmail(),
  body('password', 'Password length (min:6, max:15)')
    .isLength({min: 6, max: 15})
    .isAlphanumeric()
    .trim(),
  body('confirm')
    .custom((value, {req}) => {
    if (value !== req.body.password){
      throw new Error('Passwords not equal');
    }
    return true;
    })
    .trim(),
  body('name', 'Names length (min: 3 max: 12)')
    .isLength({min: 3, max: 12})
    .trim()
];


exports.loginValidator = [
  body('email', 'Email incorrect')
    .isEmail()
    .custom(async (value, {req}) => {
      try {
        const user = await User.findOne({email: value});
        if (user){
          const isSame = await bcrypt.compare(req.body.password, user.password);

          if (!isSame){
            return Promise.reject('Password not correct');
          }
        } else {
          return Promise.reject('Non this user');
        }
      } catch(err) {
        console.log(err);
      }
    }),
  body('password', 'Password length (min:6, max:15)')
    .isLength({min: 6, max: 15})
];


exports.courseValidator = [
  body('title')
    .isLength({min: 3})
    .withMessage('Min title length: 3 symbols')
    .trim(),
  body('price')
    .isNumeric()
    .withMessage('Only numbers in price'),
  body('image')
    .isURL()
    .withMessage('Incorrect URL')
];


exports.profileValidator = [
  body('name')
    .isLength({min: 3, max: 12})
    .withMessage('Name length: (min: 3, max: 12)')
]