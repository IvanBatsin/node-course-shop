const {Router} = require('express');
const router = Router();
const path = require('path');

//Order model
const Order = require(path.join(__dirname, '../models/order'));

//Authenticate middleware
const auth = require(path.join(__dirname, '../middleware/auth'));

router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({'user.userId': req.user._id})
      .populate('user.userId');

    res.render('orders', {
      title: 'Order page',
      isOrder: true,
      orders: orders.map(item => ({
        ...item.toJSON(),
        price: item.course.reduce((accum, item) => {
          return accum += item.count * item.courses.price;
        }, 0)
      }))
    });
  } catch (error) {
    console.log(error);
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const user = await req.user.populate('cart.items.courseId').execPopulate();

    const course = user.cart.items.map(item => ({
      courses: {...item.courseId._doc},
      count: item.count
    }));

    const order = new Order({
      course,
      user: {
        name: req.user.name,
        userId: req.user
      }
    });

    await order.save();
    await req.user.clearCart();

    res.redirect('/courses');
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;