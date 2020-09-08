const {Router} = require('express');
const router = Router();
const path = require('path');
const {validationResult} = require('express-validator');

// Courses validator
const {courseValidator} = require('../middleware/validators');

//Authenticate middleware
const auth = require(path.join(__dirname, '../middleware/auth'));

//Course model
const Course = require(path.join(__dirname, '../models/course'));

//Add page render
router.get('/', auth, async (req, res) => {
  try {
    res.render('add.hbs', {
      title: 'Add course',
      isAdd: true
    });
  } catch (error) {
    console.lof(error);
  }
});

//New course create
router.post('/', auth, courseValidator, async (req, res) => {
  try {

    const errors = validationResult(req);
    if (!errors.isEmpty()){
      return res.status(422).render('add', {
        title: 'Add course',
        isAdd: true,
        error: errors.array()[0].msg,
        data: {
          title: req.body.title,
          price: req.body.price,
          image: req.body.image
        }
      });
    }

    const course = await new Course({
      title: req.body.title,
      price: req.body.price,
      image: req.body.image,
      userId: req.user
    });
    await course.save();
    res.redirect('/courses');
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;