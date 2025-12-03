const bcrypt = require('bcrypt');
const { createUser, findUserByUsername } = require('../models/user.model');

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';
const JWT_EXPIRES_IN = '1h';

// Đăng ký
async function register(req, res) {
  const { username, userpassword, userfullname } = req.body;
  try {
    // Kiểm tra username đã tồn tại chưa
    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password rồi lưu
    const hashedPassword = await bcrypt.hash(userpassword, 10);
    const newUser = await createUser(username, hashedPassword, userfullname);

    res.json({
      message: 'User registered',
      user: { id: newUser.id, username: newUser.username, userfullname: newUser.userfullname }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Đăng nhập
async function login(req, res) {
  const { username, userpassword } = req.body;
  try {
    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(400).json({ message: "Username or password incorrect" });
    }

    const match = await bcrypt.compare(userpassword, user.userpassword);
    if (!match) {
      return res.status(400).json({ message: "Username or password incorrect" });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({
      message: "Login success",
      token,
      user: {
        id: user.id,
        username: user.username,
        userfullname: user.userfullname,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { register, login };