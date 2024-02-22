const express = require('express');
const router = express.Router();
const pool = require("../../config/database");

router.post('/', (req, res) => {
  router.use(express.json());
  const { userID } = req.body;
 
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting MySQL connection:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    const sql = 'CALL FetchSupervisorData(?)';

    connection.query(sql, [userID], (err, supervisorResults) => {
      connection.release();
      if (err) 
      {
        console.error('Error executing MySQL query:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      res.status(200).json({ supervisorResults });
    });
  });
});

module.exports = router;