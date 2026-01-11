var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

require('dotenv').config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users.route');
var authRouter = require('./routes/auth.route');
var searchRouter = require('./routes/search.route');
var recipesRouter = require('./routes/recipes.route');
var categoryRouter = require('./routes/category.route');
var notificationsRouter = require('./routes/notifications.route');
var collectionsRouter = require('./routes/collections.route')
var ingredientsRouter = require('./routes/ingredients.route')

var { connectDB } = require('./config/db'); 



var app = express();

const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',               // Cho phép chạy Local
    'https://cookieproject-git-main-vkb0205s-projects.vercel.app'    // <--- THÊM LINK VERCEL CỦA BẠN VÀO ĐÂY
  ],
  credentials: true 
}));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/search', searchRouter);
app.use('/recipes', recipesRouter);
app.use('/category', categoryRouter);
app.use('/notifications', notificationsRouter);
app.use('/collections', collectionsRouter);
app.use('/ingredients', ingredientsRouter);

connectDB(); 

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
