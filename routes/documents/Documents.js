const express = require('express');
const router = express.Router();
const pool = require("../../config/database");

router.get('/fetch-document-progress/:softwareID', (req, res) => {
    const { softwareID } = req.params;
    pool.getConnection((err, connection) => {
        if (err) 
        {
            console.error('Error getting MySQL connection:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        const documentTypes = ['User Acceptance Testing (UAT)', 'System Requirement Specification (SRS)', 'System Design Specification (SDS)', 'Business Requirement Document (BRD)'];

        const promises = documentTypes.map(documentType => {
            return new Promise((resolve, reject) => {
                const query = `CALL FetchAssignedTeamMembers(?, ?);`;

                connection.query(query, [softwareID, documentType], (error, results) => {
                    if (error) 
                    {
                        reject(error);
                    }
                    resolve(results);
                });
            });
        });

        Promise.all(promises)
            .then(combinedResults => {
                res.status(200).json(combinedResults);
            })
            .catch(error => {
                console.error('Error executing SQL queries:', error);
                res.status(500).json({ error: 'Internal server error' });
            })
            .finally(() => {
                connection.release();
            });
    });
});

router.post('/fetch-version-details', (req, res) => {
    try {
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
            res.json(rows);
          }
        );
      });
    } catch (error) {
      console.error('Error parsing request body:', error);
      res.status(400).json({ error: 'Bad Request' });
    }
  });
  

router.post('/download-pdf', (req, res) => {
    try {
        const { pdfID } = req.body;
        console.log("Received PDF ID:", pdfID);
        pool.query('SELECT file_name, file_data FROM pdf_files WHERE id = ?', [pdfId], (err, result) => {
            if (err) 
            {
                console.error('Error fetching PDF data from MySQL:', err);
                return res.status(500).send('Internal server error');
            }
            if (result.length === 0) 
            {
                return res.status(404).send('PDF not found');
            }
            const fileName = result[0].file_name;
            const fileData = result[0].file_data;
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);  
            res.setHeader('Content-Type', 'application/pdf');
            res.send(fileData);
        });
    } 
    catch (error) 
    {
        console.error('Error parsing request body:', error);
        res.status(400).json({ error: 'Bad Request' });
    }
});



module.exports = router;
