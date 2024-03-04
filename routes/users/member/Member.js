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


  
  router.get('/member-details/:member_ID', (req, res) => { console.log('backen');
    try {
      const { member_ID } = req.params;
      console.log(member_ID);
      pool.getConnection((err, connection) => {
        if (err) {
          console.error('Error getting database connection:', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
        connection.query(
          `WITH RankedVersions AS (
            SELECT  v.Document_ID, v.Version_No,  v.Status,
             ROW_NUMBER() OVER (PARTITION BY v.Document_ID ORDER BY v.Submission_Date DESC) AS RowNum
            FROM versions v
        ) SELECT sup.ID, sup.Name as 'Supervisor_name', tm.Member_ID,  tm.Name,  doc.Document_ID,
        doc.Type AS Document_Type, doc.Deadline,  soft.Software_name, soft.Software_ID, rv.Version_No, rv.Status
        FROM supervisors sup
        JOIN  team_members tm ON sup.Division = tm.Division
        JOIN assignments ass ON ass.Team_member_ID = tm.Member_ID
        JOIN documents doc ON doc.Document_ID = ass.Document_ID
        JOIN  software soft ON doc.Software_ID = soft.Software_ID
        LEFT JOIN RankedVersions rv ON rv.Document_ID = doc.Document_ID AND rv.RowNum = 1
        WHERE tm.Member_ID = ?;`,
          [member_ID],
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