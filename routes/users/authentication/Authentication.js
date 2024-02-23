const express = require('express');
const router = express.Router();
const pool = require("../../../config/database");

router.post('/', (req, res) => {
    const { userID, password } = req.body;
  
    const handleSupervisorLogin = (supervisorResults) => {
      res.status(200).json({ isSupervisor: true, userID: supervisorResults[0].ID });
    };
  
    const handleMemberLogin = (memberResults) => {
      res.status(200).json({ userID: memberResults[0].ID });
    };
  
    const handleError = (err, message) => {
      console.error('Error executing MySQL query:', err);
      res.status(500).json({ message });
    };
  
    pool.getConnection((err, connection) => {
      if (err) {
        return handleError(err, 'Internal server error');
      }
  
      const sql = `SELECT ID, Password FROM supervisors WHERE ID = ? AND Password = ?`;
  
      connection.query(sql, [userID, password], (err, supervisorResults) => {
        if (err) 
        {
          return handleError(err, 'Internal server error');
        }
  
        if (supervisorResults.length > 0) 
        {
          return handleSupervisorLogin(supervisorResults);
        }
  
        const memberSql = `SELECT ID, Password from team_members WHERE ID = ? AND Password = ?`;
        connection.query(memberSql, [userID, password], (err, memberResults) => {
          connection.release();
          if (err) 
          {
            return handleError(err, 'Internal server error');
          }
  
          if (memberResults.length > 0) 
          {
            return handleMemberLogin(memberResults);
          }
  
          console.log("User not found");
          return res.status(500).json({ message: 'User not found' });
        });
      });
    });
  });


  module.exports = router;  