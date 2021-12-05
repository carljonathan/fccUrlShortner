require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

// middleware to handle POST requests and read the body tag
app.use(bodyParser.urlencoded({ extended: false }))

// parse POST string as JSON
app.use(bodyParser.json())

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {
  const url = req.body.url_input

  res.json({ url: `${url}` })
})

app.get('/api/shorturl/:urlshort', (req, res) => {
// take request (original URL) by POST
  res.json({ url: req.params.urlshort })
// check if DB already have the url already
// if have => return json response with original url and shortened url eg. google, 1
// else assign number/randomized string to that URL as object
// save to mongoDB
// return json response with original url and shortened url eg. google, 1
// profit
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
