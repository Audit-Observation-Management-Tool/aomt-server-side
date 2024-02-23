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
//const bodyParser = require('body-parser');
//const sessionMiddleware = require('./middlewares/sessionMiddleware/SessionMiddleware');
const Users = require("./routes/users/Users");

/*
const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200,
  credentials: true
} */

app.use(cors());
app.use(express.json());

/*
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Use session middleware
app.use(sessionMiddleware);
*/

app.use("/users", Users);

app.listen(process.env.SERVER_PORT, () => {
  console.log(`Server running on port ${process.env.SERVER_PORT}`);
});