//Middleware для передачи на фрон некотрых переменных

module.exports = function (req, res, next){
  //добавляем данные, которые будут отдаваться в шаблон каждый раз
  res.locals.isAuth = req.session.isAuthenticate;
  res.locals.csrf = req.csrfToken();
  next();
}