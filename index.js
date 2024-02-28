const express = require('express');
const app = express();
const cors = require('cors');
const Authentication = require("./routes/users/authentication/Authentication");
const Supervisor = require("./routes/users/supervisor/Supervisor");
const Member = require("./routes/users/member/Member");
const PieChart = require("./routes/charts/pieChart/PieChart");
const BarChart = require("./routes/charts/barChart/BarChart");
const Documents = require("./routes/documents/Documents");
require('dotenv/config');

async function connectAndStartServer() {
  try 
  {
    app.use(cors());
    app.use(express.json());

    app.use("/authenticate", Authentication);
    app.use("/supervisor",Supervisor);
    app.use("/member",Member);
    app.use("/documents",Documents);

    const port = process.env.SERVER_PORT ;
    
    app.listen(port, () => 
    {
      console.log(`Server running on port ${port}`);
    });
  } 
  catch (err) 
  {
    console.error("Error starting the server:", err);
  }
}

connectAndStartServer();