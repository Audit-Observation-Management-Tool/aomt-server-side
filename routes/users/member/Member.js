const express = require('express');
const router = express.Router();
const pool = require("../../../config/database");

  router.get('/:userID', (req, res) => {
    const { userID } = req.params; 
    pool.getConnection((err, connection) => {
      if (err) 
      {
        console.error('Error getting MySQL connection:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
  
      const sql = 'CALL FetchMemberData(?)';
  
      connection.query(sql, [userID], (err, memberResults) => {
        connection.release();
        if (err) 
        {
          console.error('Error executing MySQL query:', err);
          return res.status(500).json({ message: 'Internal server error' });
        }
        res.status(200).json({ isSupervisor: false, memberData: memberResults[0] });
      });
    });
  });


  
  router.get('/member-details', (req, res) => { console.log('backen');
    try {
      const { memberID } = req.body;
      pool.getConnection((err, connection) => {
        if (err) {
          console.error('Error getting database connection:', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
        connection.query(
          `select * from supervisors join team_members on supervisors.Division=team_members.Division
          join assignments on assignments.Team_member_ID=team_members.Member_ID 
          join documents on documents.Document_ID=assignments.Document_ID
          join software on documents.Software_ID=software.Software_ID
          where team_members.Member_ID=1;`,
          [memberID],
          (queryErr, rows) => {
            connection.release();
  
            if (queryErr) {
              console.error('Error executing SQL query:', queryErr);
              res.status(500).json({ error: 'Internal Server Error' });
              return;
            }
  
            if (!rows || rows.length === 0) 
            {
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