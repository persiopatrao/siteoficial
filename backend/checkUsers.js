const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('auth.db');
db.all('SELECT id, username, email, role, status FROM users', (err, rows) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(JSON.stringify(rows, null, 2));
  db.close();
});
