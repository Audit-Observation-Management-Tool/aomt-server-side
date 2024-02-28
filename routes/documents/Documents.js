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
                const query = `CALL FetchSoftwareDocumentInformation(?, ?);`;

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
                //console.log(combinedResults);
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
      const { softwareID, documentID } = req.body;
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
          where Software_ID=? and Document_ID=? order by Version_No DESC;`,
          [softwareID, documentID],
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
        const { softwareID, documentType } = req.body;
        console.log("Received :", req.body);
        pool.query('SELECT Attachments FROM attachments WHERE Software_ID = ? AND Type = ?', [softwareID, documentType], (err, result) => {
            if (err) 
            {
                console.error('Error fetching PDF data from MySQL:', err);
                return res.status(500).send('Internal Server Error');
            }
            if (result.length === 0) {
                return res.status(404).send('PDF Not Found');
            }
            const PDF = result[0].Attachments;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="document.pdf"'); 
            res.send(PDF);
        });
    } catch (error) {
        console.error('Error handling request:', error);
        res.status(400).json({ error: 'Bad Request' });
    }
});

module.exports = router;