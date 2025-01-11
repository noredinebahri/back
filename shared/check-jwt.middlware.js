require('dotenv').config();
const jwt = require('jsonwebtoken');
const SECRET_KEY3 = 'ljksqdsdfgklsdjgkljskdfg2sdfg@df45fd4g'

exports.checkJwtAndExpired =  (req, res, next) => {
     const token = req.headers.authorization.split(' ')[1];
     jwt.verify(token, SECRET_KEY3, (err, decoded) => {
          if (err) {
               return res.status(401).json({ message: 'Auth failed' });
          }
          req.userData = decoded;
          next();
     });
};
// check the role of user
exports.checkRole = (role) => {
     return (req, res, next) => {
          if (req.userData.role !== role) {
                return res.status(401).json({ message: 'Auth failed' });
          }
          next();
     };
};
