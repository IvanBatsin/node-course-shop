const {Schema, model} = require('mongoose');

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  name: String,
  password: {
    type: String,
    required: true
  },
  resetToken: String,
  resetTokenExp: Date,
  avatarUrl: String,
  cart: {
    items: [
      {
        count: {
          type: Number,
          default: 0,
          required: true
        },
        courseId: {
          required: true,
          type: Schema.Types.ObjectId,
          ref: 'Course'
        }
      }
    ]
  }
});

//Можем определить метод, в который можем перенести логику
userSchema.methods.addToCart = function (course){ //используем (function) для соблюдения контекста
  const items = [...this.cart.items]; //разворачиваем массив

  // (item.courseId.toString()) - используем привидение к строке из-за (Schema.Types.ObjectId)
  const index = items.findIndex(item => item.courseId.toString() === course._id.toString());

  if (index >= 0){
    items[index].count++;
  } else {
    items.push({
      courseId: course.id,
      count: 1
    });
  }
 
  //(items) - так как ключ значение совпадают
  this.cart = {items};
  return this.save();
}

userSchema.methods.removeItem = function(id){
  let items = [...this.cart.items];
  const index = items.findIndex(item => item.courseId.toString() === id.toString());

  if (items[index].count === 1){
    items = items.filter(item => item.courseId.toString() !== id.toString());
  } else {
    items[index].count--;
  }

  this.cart = {items};
  return this.save();
}

userSchema.methods.clearCart = function(){
  this.cart = {items: []};
  return this.save();
}

module.exports = model('User', userSchema);