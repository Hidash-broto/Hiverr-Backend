const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    // eslint-disable-next-line consistent-return
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.json({ status: false, message: err.message, jwt: true });
      req.body.userId = decoded.id;
      next();
    });
  } catch (error) {
    res.json({ status: false, message: error.message });
  }
};
