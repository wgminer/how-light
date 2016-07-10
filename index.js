'use strict';

// imports
const fs = require('fs');

// simple express server
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const multer = require('multer');

const router = express.Router();

const port = process.env.PORT || 8080;

app.use(express.static('public'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/', (req, res) => {
    res.sendfile('./public/index.html');
});

// app.get('/templates/expense-modal.html', (req, res) => {
//     res.sendfile('./public/templates/expense-modal.html');
// });

app.listen(port, function () {
    console.log('Our app is running on http://localhost:' + port);
});