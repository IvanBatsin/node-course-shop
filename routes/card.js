const {Router} = require('express');
const router = Router();
const path = require('path');

//Course model
const Course = require(path.join(__dirname, '../models/course'));

//Authenticate middleware
const auth = require(path.join(__dirname, '../middleware/auth'));

function mapCartItems(cart){
  return cart.items.map(item => ({
    courseId: item.courseId._doc,
    count: item.count,
    id: item.courseId.id
  }));
}

function computePrice(courses){
  return courses.reduce((accum, item) => {
    return accum += item.count * item.courseId.price;
  }, 0);
}

//Render cart page
router.get('/', auth, async (req, res) => {
  try {
    const user = await req.user
      .populate('cart.items.courseId')
      .execPopulate();

    const courses = mapCartItems(user.cart);
    
    res.render('card', {
      title: 'Card',
      isCard: true,
      courses: courses,
      price: computePrice(courses)
    });
  } catch (error) {
    console.log(error);
  }
});

//Add item to cart
router.post('/add', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.body.id);
    await req.user.addToCart(course);
    res.redirect('/card');
  } catch (error) {
    console.log(error);
  }
});

//Remove itam from cart
router.delete('/remove/:id', auth, async (req, res) => {
  try {
    await req.user.removeItem(req.params.id);
    const user = await req.user.populate('cart.items.courseId').execPopulate();

    const courses = mapCartItems(user.cart);

    res.json({
      courses: courses,
      price: computePrice(courses)
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;