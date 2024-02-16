const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors(), express.json());
require('dotenv/config');
require('./config/database');

async function connectAndStartServer() {
  app.listen(process.env.PORT, () => {
    console.log(`Server running!`);
  });
}

connectAndStartServer().catch(err => {
  console.error(err);
});