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


  module.exports = router;  