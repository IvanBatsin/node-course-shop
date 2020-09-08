const express = require('express');
const app = express();
const csrf = require('csurf');
const mongoose = require('mongoose');
const path = require('path');
const config = require(path.join(__dirname, '/config'));
const expHbs = require('express-handlebars');
const errorPage = require('./middleware/404page');
const helmet = require('helmet');
const compression = require('compression');

//Errors transport
const flash = require('connect-flash');

//File upload middleware (multer)
const fileMiddleware = require('./middleware/file');

//Session and store
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session); //вызываем функцию, где указываем пакет

//Check session middleware
const Check = require(path.join(__dirname, '/middleware/variables'));
//User middleware
const userMD = require(path.join(__dirname, '/middleware/user'));

//Routers
const routers = require(path.join(__dirname, 'allRoutes'));

//View engine setting
const hbs = expHbs.create({
  defaultLayout: 'main',
  extname: 'hbs',
  helpers: require(path.join(__dirname, '/utils/hbs-helper'))
});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

//Static
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images'))); //первый параметр (строковое значение где лежат файлы)

//Get data from front
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Session store
const store = new MongoStore({
  collection: 'sessions',
  uri: config.MONGO_URL
});

//Session setup
app.use(session({
  resave: false,
  secret: config.SECRET,
  saveUninitialized: false,
  store
}));

//File middleware before csrf
app.use(fileMiddleware.single('avatar'));

//Csrf after session 
app.use(csrf());

//HTTP headers
app.use(helmet());

//Compress http response
app.use(compression());

//Errors tranporter
app.use(flash());

//Check session
app.use(Check);

//req.user middleware
app.use(userMD);

//Routes
app.use('/', routers.home);
app.use('/add', routers.add);
app.use('/courses', routers.courses);
app.use('/card', routers.card);
app.use('/order', routers.order);
app.use('/auth', routers.auth);
app.use('/profile', routers.profile);

//Error handler middleware
app.use(errorPage);

async function start(){
  try {
    mongoose.set('debug', config.DEBUG);
    mongoose.connection
      .on('open', () => console.log('Db is ready'))
      .on('close', () => console.log('Db is close'))
      .on('error', (error) => console.log(error));

    await mongoose.connect(config.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    });

    app.listen(config.PORT, () => console.log('we on air'));
  } catch (error) {
    console.log(error);
  }
}

start();