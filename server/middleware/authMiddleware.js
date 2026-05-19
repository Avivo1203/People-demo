const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;

  // בדרך כלל שולחים את ה-Token ב-Headers תחת המפתח Authorization בצורה של: Bearer <token>
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // מפרקים את המחרוזת כדי לקחת רק את ה-Token עצמו בלי המילה Bearer
      token = req.headers.authorization.split(' ')[1];

      // מפענחים ומאמתים את ה-Token באמצעות המפתח הסודי שלנו
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // מוסיפים את ה-ID של המשתמש מתוך ה-Token לתוך אובייקט ה-req (כדי שהראוט הבא ידע מי המשתמש)
      req.userId = decoded.id;

      // הכל תקין! עוברים לפונקציה הבאה בשרשרת
      return next();
    } catch (error) {
      console.error('Token validation error:', error);
      return res.status(401).json({ message: 'לא מורשה, ה-Token שגוי או פג תוקף' });
    }
  }

  // אם בכלל לא נשלח Token
  if (!token) {
    return res.status(401).json({ message: 'לא מורשה, לא נשלח Token' });
  }
};

module.exports = { protect };