const {Router} = require('express');
const router = Router();
const path = require('path');
const {validationResult} = require('express-validator');

//Edit course validator
const {courseValidator} = require('../middleware/validators');

//Model
const Course = require(path.join(__dirname, '../models/course'));

//Authenticate middleware
const auth = require(path.join(__dirname, '../middleware/auth'));

//Access cheker function
function isOwner(courseId, userId){
  return courseId.toString() === userId.toString();
}

//Courses page
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find();

    res.render('courses', {
      title: 'Courses page',
      isCourses: true,
      courses: courses.map(item => item._doc),
      userId: req.user ? req.user._id.toString() : null
    });
  } catch (error) {
    console.log(error);
  }
});

//Item course page render
router.get('/:id/edit', auth, async (req, res) => {
  if (!req.query.allow){
    res.redirect('/');
  }
  try {
    const course = await Course.findById(req.params.id);

    if (isOwner(course.userId, req.user._id)){
      res.render('course-edit', {
        title: `Edit ${course.title} course`,
        course: course._doc
      });
    } else {
      res.redirect('/courses');
    }
  } catch (error) {
    console.log(error);
  }
});

//Edit item course edit
router.post('/edit', auth, courseValidator, async (req, res) => {
  try {
    const errors = validationResult(req);
    const {id} = req.body;

    if (!errors.isEmpty()){
      return res.status(422).redirect(`/courses/${id}/edit?allow=true`)
    }

    delete req.body.id;
    const course = await Course.findById(id);

    if (isOwner(course.userId, req.user._id)){
      Object.assign(course, req.body);
      await course.save();
      res.redirect('/courses');
    } else {
      res.redirect('/courses');
    }
  } catch (error) {
    console.log(error);
  }
});

//Item course page render
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    res.render('courseItem', {
      layout: 'empty',
      title: `${course.title} course`,
      course: course._doc
    });
  } catch (error) {
    console.log(error);
  }
});

//Remove item course
router.post('/remove', async (req, res) => {
  try {
    await Course.deleteOne({
      _id: req.body.id,
      userId: req.user._id
    });
    res.redirect('/courses');
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;