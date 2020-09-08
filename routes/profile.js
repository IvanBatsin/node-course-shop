const {Router} = require('express'); 
const router = Router();
const path = require('path');

//Validation
const {validationResult} = require('express-validator');
const {profileValidator} = require('../middleware/validators');

//User model
const User = require(path.join(__dirname, '../models/user'));

//Authentication middleware check
const auth = require('../middleware/auth');

//Profile page render
router.get('/', auth, async (req, res) => {
  try {
    res.render('profile', {
      title: 'Profile page',
      isProfile: true,
      user: req.user.toObject()
    });
  } catch (error) {
    console.log(error);
  }
});

//Profile page post request
router.post('/', auth, profileValidator, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.render('profile', {
        title: 'Profile page',
        isProfile: true,
        user: req.user.toObject(),
        error: errors.array()[0].msg
      });
    }

    const toChange = {
      name: req.body.name,
    };

    if (req.file){
      toChange.avatarUrl = req.file.path;
    }

    Object.assign(user, toChange);
    await user.save();
    res.redirect('/profile');
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;