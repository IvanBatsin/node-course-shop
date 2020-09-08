module.exports = function(req, res, next){
  if (!req.session.isAuthenticate){
    return res.redirect('/auth#login')
  }
  next();
}