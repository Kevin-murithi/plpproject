const db = require('../models/db');
const bcrypt = require('bcryptjs');

module.exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check for missing fields
    if (!username || !email || !password) {
      return res.status(400).send('All fields are required');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // SQL query to insert the new user
    const sql = 'INSERT INTO business (username, email, password) VALUES (?, ?, ?)';
    const values = [username, email, hashedPassword];

    // Insert the user into the database
    await db.promise().query(sql, values);
    res.redirect(200, '/signIn');
  } 
  catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).send('Internal Server Error');
  }
}

module.exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const sql = 'SELECT * FROM business WHERE username = ?';
    const [results] = await db.promise().query(sql, [username]);

    if (results.length > 0) {
        const match = await bcrypt.compare(password, results[0].password);
        if (match) {
            req.session.user_id = results[0].user_id;
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, message: 'Invalid Username or Password!' });
        }
    } else {
        res.status(401).json({ success: false, message: 'Invalid Username or Password!' });
    }
  } 
  catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

module.exports.profile = async (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).json({ message: 'Not logged in' });
  }

  const user_id = req.session.user_id;
  db.query('SELECT username, email FROM business WHERE user_id = ?', [user_id], (err, results) => {
      if (err || results.length === 0) {
          return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(results[0]);
  });
}

