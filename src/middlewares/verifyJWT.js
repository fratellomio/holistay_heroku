const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).send('Invalid token'); //invalid token
    req.user = decoded.email;
    next();
  });
};

module.exports = verifyJWT;
