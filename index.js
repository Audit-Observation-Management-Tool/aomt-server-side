const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors(), express.json());
require('dotenv/config');
const SignIn = require("./routes/signinRoute/SignIn");
const FetchSupervisorData = require("./routes/supervisorRoute/FetchSupervisorData");
const SupervisorDashboard = require("./routes/signinRoute/SupervisorDashboard");


async function connectAndStartServer() 
{
  app.use("/sign-in", SignIn);
  app.use("/supervisor-dashboard", SupervisorDashboard);
  app.use("/fetch-supervisor-data", FetchSupervisorData);
  app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server running on port`);
  });
}






connectAndStartServer().catch(err => {
  console.error(err);
});