//Helper позволяет добавлять новые функции, которые мы можем использовать в шаблоне

module.exports = {
  ifeq(a, b, options){
    if (a == b){
      return options.fn(this)
    }
    return options.inverse(this)
  }
}