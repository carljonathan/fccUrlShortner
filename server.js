require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_URI)
const Schema = mongoose.Schema

// create mongoose schema for shortUrl
const shortUrlSchema = new Schema({
  // original url
  original_url: { type: String, required: true },
  // short url
  short_url: Number
})

// create mongoose model for shortUrlSchema
const ShortUrl = mongoose.model('ShortUrl', shortUrlSchema)

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

app.post('/api/shorturl', async (req, res) => {
  // take request (original URL) by POST
  const url = req.body.url
  res.json(url)
  /*
  // check if DB already have the url
  const findDoc = async (url, done) => {
    await ShortUrl.findOne({ original_url: url }, async (err, doc) => {
      if (err) return console.error(err) // log error if error
      done(null, doc)
    })
  }
  console.log(findDoc)
  if (!findDoc) {
    async function myFunc (done) {
      let newShort
      const latestDoc = await ShortUrl.find().sort({ _id: -1 }).limit(1).exec((err, result) => {
        if (err) console.error(err)
        done(null, result)
      })
      if (!latestDoc) newShort = 1
      newShort = latestDoc.shortUrl++
      const shortUrl = new ShortUrl({ original_url: url, short_url: newShort })
      shortUrl.save((err, data) => {
        if (err) console.error(err)
        done(null, data)
        res.json(shortUrl)
      })
    }
  } else { // if the doc is present
    res.json(findDoc)
  }*/
  // if have => return json response with original url and shortened url eg. google, 1
  // else assign number/randomized string to that URL as object
  // save to mongoDB
  // return json response with original url and shortened url eg. google, 1
})

app.get('/api/shorturl/:urlshort', (req, res) => {
  // GET shortUrl in url
  // check DB for match
  // if found => redirect to original url
  // else => json response "no short url found for given input"
  res.json({ url: req.params.urlshort })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
