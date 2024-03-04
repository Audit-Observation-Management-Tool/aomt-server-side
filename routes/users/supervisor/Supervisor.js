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

router.post('/review-doc', (req, res) => { console.log('backend');
  try {
    const { status, remarks, documentID } = req.body;
    const updatedStatus = status === 'return' ? 'Returned' : 'Accepted';
    let Version_ID;

    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting database connection:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }

      // Step 1: Select the VID based on Document_ID and the maximum Version_No
      connection.query(
        `SELECT VID FROM versions
        WHERE Document_ID=? and (Document_ID, Version_No) IN (
            SELECT Document_ID, MAX(Version_No) AS MaxVersion
            FROM versions
            GROUP BY Document_ID
        );`,[documentID],
        (queryErr, rows) => {
          if (queryErr) {
            connection.release();
            console.error('Error executing SQL query:', queryErr);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
          }

          if (!rows || rows.length === 0) {
            connection.release();
            console.log('No matching version found');
            res.status(404).json({ error: 'Not Found' });
            return;
          }

          Version_ID = rows[0].VID;

          // Step 2: Update the version with new status and remarks
          connection.query(
            `UPDATE versions
            SET Status=?, Remarks=?
            WHERE VID=?`,
            [updatedStatus, remarks, Version_ID],
            (updateErr, updateRows) => {
              connection.release();

              if (updateErr) {
                console.error('Error executing update query:', updateErr);
                res.status(500).json({ error: 'Internal Server Error' });
                return;
              }
              console.log(Version_ID);
              
              res.json(updateRows);
            }
          );
        }
      );
    });
  } catch (error) {
    console.error('Error parsing request body:', error);
    res.status(400).json({ error: 'Bad Request' });
  }
});


module.exports = router;  




