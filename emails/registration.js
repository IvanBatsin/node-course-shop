const config = require('../config');

module.exports = function (email){
  return {
    to: email,
    from: config.EMAIL,
    subject: 'Account created',
    html: `
      <h1>Welcome to our shop</h1>
      <p>Your account successfully ceated (${email})</p>
      <hr>
      <a href="${config.BASE_URL}">Site</a>
    `
  }
}