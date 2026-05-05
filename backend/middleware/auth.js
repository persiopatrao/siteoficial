const jwt = require('jsonwebtoken');

const SECRET_KEY = 'your_secret_key';

function verifyToken(req, res, next) {
  let token = req.headers['authorization'];
  
  if (!token) {
    return res.status(403).json({ error: 'Token required' });
  }

  if (token.startsWith('Bearer ')) {
    token = token.slice(7);
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
}

module.exports = { verifyToken };
