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

// 👇 SỬA ĐOẠN NÀY
app.use(cors({
  origin: [
    'http://localhost:5173', // Cho phép Localhost của bạn (Frontend)
    'http://localhost:3000', // Phòng hờ nếu bạn chạy port khác
    // Sau này deploy frontend lên Vercel thì thêm link vào đây, ví dụ:
    // 'https://cookieproject.vercel.app' 
  ],
  credentials: true // 👈 BẮT BUỘC: Cho phép nhận cookies/token từ Frontend
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
