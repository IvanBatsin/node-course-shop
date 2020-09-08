const path = require('path');
const home = require(path.join(__dirname, 'routes', 'home'));
const add = require(path.join(__dirname, 'routes', 'add'));
const courses = require(path.join(__dirname, 'routes', 'courses'));
const card = require(path.join(__dirname, 'routes', 'card'));
const order = require(path.join(__dirname, 'routes', 'order'));
const auth = require(path.join(__dirname, 'routes', 'auth'));
const profile = require(path.join(__dirname, 'routes', 'profile'));

module.exports = {
  home,
  add,
  courses,
  card,
  order,
  auth,
  profile
};