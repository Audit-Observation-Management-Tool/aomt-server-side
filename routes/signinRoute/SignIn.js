const express = require('express');
const router = express.Router();
const pool = require("../../config/database");

router.post('/', (req, res) => {
  router.use(express.json());
  const { userID, password } = req.body;
 
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting MySQL connection:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    const sql = `SELECT ID, Password FROM supervisors WHERE ID = ? AND Password = ?`;

    connection.query(sql, [userID, password], (err, supervisorResults) => {
      if (err) 
      {
        console.error('Error executing MySQL query:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      const correctSupervisorPassword = supervisorResults.length === 0 ? -1 : supervisorResults[0].Password;

      if (correctSupervisorPassword != -1) 
      {
        return res.status(200).json({ userID: supervisorResults[0].ID });
      } 
      else 
      {
        const memberSql = `SELECT ID, Password from team_members WHERE ID = ? AND Password = ?`;
        connection.query(memberSql, [userID, password], (err, memberResults) => {
          connection.release();
          if (err) 
          {
            console.error('Error executing MySQL query:', err);
            return res.status(500).json({ message: 'Internal server error' });
          }
         
          if (memberResults.length === 0) 
          {
            console.log("User not found");
            return res.status(500).json({ message: 'User not found' });
          }
    
          const correctMemberPassword = memberResults[0].Password;
          if (correctMemberPassword === password) 
          {
            return res.status(200).json({ userID: memberResults[0].ID });
          } 
          else 
          {
            return res.status(500).json({ message: 'User does not exist' })
          }
        });
      }
    });
  });
});

module.exports = router;