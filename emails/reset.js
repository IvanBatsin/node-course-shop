const config = require('../config');

module.exports = function(email, token){
  return {
    to: email,
    from: config.EMAIL,
    subject: 'Reset password',
    html: `
      <h1>You forgot password?</h1>
      <p>if NO, just ignore this message</p>
      <p>else, click this link:</p>
      <p><a href="${config.BASE_URL}/auth/password/${token}">Recover password</a></p>
      <hr>
      <a href="${config.BASE_URL}">Site</a>
    `
  }
}