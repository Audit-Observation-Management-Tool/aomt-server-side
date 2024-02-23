const express = require('express');
const session = require('express-session');
//const mysqlStore = require('express-mysql-session')(session);
const pool = require("../../config/database");
const { GenerateSessionSecretKey } = require('../../utils/sessionSecretKeyGenerator/GenerateSessionSecretKey');

require("dotenv").config();

/*
const Options = {
    connectionLimit: 10,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    createDatabaseTable: true
}; */

const sessionSecretKey = GenerateSessionSecretKey(); 
const SessionMiddleware = express();
//const sessionStore = new mysqlStore(Options, pool);

SessionMiddleware.use(session({
    secret: sessionSecretKey,
    resave: false, 
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        SameSite: "none",
        httpOnly: true
    },
   // store: sessionStore,
}));

module.exports = SessionMiddleware;