const express = require('express');
const router = express.Router();
const pool = require("../../config/database");
console.log('SupervisorDashboard module imported!');


router.post('/', (req, res) => { 
    router.use(express.json());
    console.log('backend');
    try {
      const { supervisorId } = req.body;
  
      // Get a connection from the pool
      pool.getConnection((err, connection) => {
        if (err) {
          console.error('Error getting database connection:', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
  
        // Use the callback-style query method
        connection.query(
          `
            SELECT *
            FROM software
            WHERE Supervisor_ID = ?`,
          [supervisorId],
          (queryErr, rows) => {
            // Release the connection back to the pool
            connection.release();
  
            if (queryErr) {
              console.error('Error executing SQL query:', queryErr);
              res.status(500).json({ error: 'Internal Server Error' });
              return;
            }
  
            if (!rows || rows.length === 0) {
              // No rows found
              console.log('No software found for supervisor ID:', supervisorId);
              res.status(404).json({ error: 'Not Found' });
              return;
            }
  
            console.log('Rows:', rows);
            res.json(rows); // Send the array directly, assuming it's an array of software objects
          }
        );
      });
    } catch (error) {
      console.error('Error parsing request body:', error);
      res.status(400).json({ error: 'Bad Request' });
    }
  });
  
  module.exports = router;