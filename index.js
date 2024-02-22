const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors(), express.json());
require('dotenv/config');
const pool = require("./config/database");
const SignIn = require("./routes/signinRoute/SignIn");
const SupervisorDashboard = require("./routes/signinRoute/SupervisorDashboard");


async function connectAndStartServer() 
{
  app.use("/sign-in", SignIn);
  app.use("/supervisor-dashboard", SupervisorDashboard);
  app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server running on port`);
  });
}






connectAndStartServer().catch(err => {
  console.error(err);
});