const express = require('express');
const router = express.Router();
const pool = require("../../config/database");
const { GenerateDocumentVersion } = require("../../utils/generateDocumentVersion/GenerateDocumentVersion");
const multer = require("multer");
const upload = multer();


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
               // console.log(combinedResults[1]);
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
      console.log(req.body);
      pool.getConnection((err, connection) => {
        if (err) {
          console.error('Error getting database connection:', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
  
        connection.query(
          `Select * from 
          software join documents on software.Software_ID=documents.Software_ID
			join versions on versions.Document_ID=documents.Document_ID
          join team_members on versions.Member_ID=team_members.Member_ID
          where software.Software_ID=? and documents.Document_ID=? order by Version_No DESC;`,
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
            console.log(rows);
          }
        );
      });
    } catch (error) {
      console.error('Error parsing request body:', error);
      res.status(400).json({ error: 'Bad Request' });
    }
  });


  router.post('/fetch-member-list', (req, res) => {
    try {
      const { softwareID, } = req.body;
      pool.getConnection((err, connection) => {
        if (err) {
          console.error('Error getting database connection:', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
        connection.query(
          `select distinct team_members.Member_ID, team_members.Name, team_members.Email, team_members.Phone
          from software join documents 
                   on software.Software_ID=documents.Software_ID
                   join assignments on assignments.Document_ID=documents.Document_ID
                   join team_members on team_members.Member_ID=assignments.Team_member_ID
                   where software.Software_ID=1;`,
          [softwareID],
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
            console.log('memeber list:', rows);
            res.json(rows);
          }
        );
  
      });
    } catch (error) {
      console.error('Error parsing request body:', error);
      res.status(400).json({ error: 'Bad Request' });
    }
  });


  router.get('/barchart', (req, res) => { //console.log('backen');
    try {
      const { softwareID, } = req.body;
      pool.getConnection((err, connection) => {
        if (err) {
          console.error('Error getting database connection:', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
        connection.query(
          `SELECT COUNT(v.VID) AS count, SUBSTRING_INDEX(SUBSTRING_INDEX(d.Type, '(', -1), ')', 1) as type
          FROM software s
            JOIN documents d ON s.Software_ID = d.Software_ID
            LEFT JOIN versions v ON d.Document_ID = v.Document_ID
          WHERE s.Software_ID = 1
          GROUP BY d.Type;`,
          [softwareID],
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
            //console.log('Query results:', rows);
            res.json(rows);
          }
        );
  
      });
    } catch (error) {
      console.error('Error parsing request body:', error);
      res.status(400).json({ error: 'Bad Request' });
    }
  });



  router.get('/arcprogress', (req, res) => {//console.log('backendd');
  try {
    const { softwareID, } = req.body;
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting database connection:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      connection.query(
      `WITH MaxSubmissionDates AS (SELECT "Document_ID",
      MAX("Submission_Date") AS "Largest_Submission_Date"FROM 
      "versions" WHERE
      "Document_ID" IN (SELECT "Document_ID" FROM "documents" WHERE "Software_ID" = 1) -- Replace with the desired Software_ID
      GROUP BY "Document_ID")
      SELECT 
      d."Document_ID", SUBSTRING_INDEX(SUBSTRING_INDEX(d.Type, '(', -1), ')', 1) AS "Document_Type",m."Largest_Submission_Date", v."Status"
      FROM "documents" d
      JOIN MaxSubmissionDates m ON d."Document_ID" = m."Document_ID"
      JOIN "versions" v ON m."Document_ID" = v."Document_ID" AND m."Largest_Submission_Date" = v."Submission_Date"
      WHERE  d."Software_ID" = 1;`,
        [softwareID],
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
          //console.log('Query results:', rows);
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

router.post('/upload-pdf/:softwareID/:documentType', upload.single('file'), (req, res) => {

    const {softwareID, documentType} = req.params;
    if (!req.file) {
        return res.status(400).send('No PDF file uploaded.');
    }

    const fileData = req.file.buffer;

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection:', err);
            return res.status(500).send('Internal server error');
        }

        const selectQuery = 'SELECT Version_No FROM attachments WHERE Software_ID = ? AND Type = ?';
        connection.query(selectQuery, [softwareID, documentType], (err, rows) => {
            if (err) {
                connection.release();
                console.error('Error querying database:', err);
                return res.status(500).send('Internal server error');
            }

            const oldVersion = rows[0].Version_No;

            if(oldVersion == null) oldVersion = "0.9.9";

            const newDocumentVersion = GenerateDocumentVersion(oldVersion);

            if (rows[0].Version_No === null) 
            {
                const insertQuery = 'INSERT INTO attachments (Software_ID, Version_No, Type, Attachments) VALUES (?, ?, ?, ?)';
                connection.query(insertQuery, [softwareID, newDocumentVersion, documentType, fileData], (err, result) => {
                    connection.release();
                    if (err) {
                        console.error('Error inserting data into MySQL:', err);
                        return res.status(500).send('Internal server error');
                    }
                    res.status(200).send('PDF file uploaded and saved to MySQL database.');
                });
            } 
            else 
            {
                const updateQuery = 'UPDATE attachments SET Attachments = ?, Version_No = ? WHERE Software_ID = ? AND Type = ?';
                connection.query(updateQuery, [fileData, newDocumentVersion, softwareID, documentType], (err, result) => {
                    connection.release();
                    if (err) {
                        console.error('Error updating data in MySQL:', err);
                        return res.status(500).send('Internal server error');
                    }
                    res.status(200).send('PDF file updated and saved to MySQL database.');
                });
            }
        });
    });
});

router.post("/upload-change-message", (req, res) => {
  const { memberID, documentID, content, softwareID } = req.body;

  console.log(req.body);

  if (content) 
  {

    pool.getConnection((err, connection) => {
      if (err) {
          console.error('Error getting MySQL connection:', err);
          return res.status(500).send('Internal server error');
      }

      const selectQuery = 'SELECT Version_No FROM attachments WHERE Software_ID = ? AND Type = (SELECT Type from documents where Document_ID = ?)';
      connection.query(selectQuery, [softwareID, documentID], (err, rows) => {
          if (err) 
          {
              connection.release();
              console.error('Error querying database:', err);
              return res.status(500).send('Internal server error');
          }

          const newDocumentVersion = rows[0].Version_No;
          const currentDate = new Date();

          const insertQuery = 'INSERT INTO versions (Change_log, Status, Document_ID, Member_ID, Version_No, Submission_Date) VALUES (?, ?, ?, ?, ?, ?)';
          connection.query(insertQuery, [content, "Not Reviewed", documentID, memberID, newDocumentVersion, currentDate], (err, result) => {
              connection.release();
              if (err) 
              {
                  console.error('Error inserting data into MySQL:', err);
                  return res.status(500).send('Internal server error');
              }
              res.status(200).send('PDF file uploaded and saved to MySQL database.');
          });
      });
  });
  } 
  else 
  {
    res.status(400).send("Invalid content format.");
  }
});


/*
router.get('/rich-text-content', (req, res) => {
  // Query to fetch rich text content from the database
  const sql = 'SELECT rich_text_content FROM test where id=1';

  // Execute the query
  pool.query(sql, (error, results) => {
    if (error) {
      console.error('Error fetching rich text content:', error);
      res.status(500).send('Internal server error.');
    } else {
      // Extract rich text content from the results
      const richTextContent = results.map(row => row.rich_text_content);
      res.json(richTextContent); // Send the rich text content as JSON response
    }
  });
});
*/


module.exports = router;