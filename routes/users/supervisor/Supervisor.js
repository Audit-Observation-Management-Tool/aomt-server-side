const express = require('express');
const router = express.Router();
const pool = require("../../../config/database");

router.get('/:userID', (req, res) => {
  const { userID } = req.params;
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting MySQL connection:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    const sql = 'CALL FetchSupervisorData(?)';

    connection.query(sql, [userID], (err, supervisorResults) => {
      connection.release();
      if (err) {
        console.error('Error executing MySQL query:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      res.status(200).json({ supervisorData: supervisorResults[0] });
    });
  });
});


router.post('/', (req, res) => {
  try {
    const { supervisorId } = req.body;

    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting database connection:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }

      connection.query(
        `SELECT *
            FROM software
            WHERE Supervisor_ID = ?`,
        [supervisorId],
        (queryErr, rows) => {
          connection.release();

          if (queryErr) {
            console.error('Error executing SQL query:', queryErr);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
          }

          if (!rows || rows.length === 0) {
            console.log('No software found for supervisor ID:', supervisorId);
            res.status(404).json({ error: 'Not Found' });
            return;
          }
          res.json(rows);
        }
      );
    });
  } catch (error) {
    console.error('Error parsing request body:', error);
    res.status(400).json({ error: 'Bad Request' });
  }
});


router.post('/a', (req, res) => {
  console.log('backend');
  try {
    //const { supervisorId } = req.body;

    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting database connection:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }

      connection.query(
        `Select * from 
        software natural join documents 
        natural join versions 
        join team_members on versions.Member_ID=team_members.Member_ID
        where Software_ID=1 and Document_ID=1 order by Version_No DESC;`,
      
        (queryErr, rows) => {
          connection.release();

          if (queryErr) {
            console.error('Error executing SQL query:', queryErr);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
          }

          if (!rows || rows.length === 0) {
            console.log('No software found for supervisor ID:', supervisorId);
            res.status(404).json({ error: 'Not Found' });
            return;
          }
          console.log('Query results:', rows);
          res.json(rows);
        }
      );
    });
  } catch (error) {
    console.error('Error parsing request body:', error);
    res.status(400).json({ error: 'Bad Request' });
  }
});


module.exports = router;  