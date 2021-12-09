require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_URI)

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

// middleware to handle POST requests and read the body tag
app.use(bodyParser.urlencoded({ extended: false }))

// parse POST string as JSON
app.use(bodyParser.json())

app.use('/public', express.static(`${process.cwd()}/public`));

const Schema = mongoose.Schema

// create mongoose schema for shortUrl
const shortUrlSchema = new Schema({
  // original url
  original_url: { type: String, required: true },
  // short url
  short_url: { type: Number, required: true }
})

// create mongoose model for shortUrlSchema
const ShortUrl = mongoose.model('ShortUrl', shortUrlSchema)

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
  console.log(url)

  // try to find existing Url in db
  try {
    const existingUrl = await ShortUrl.findOne({ original_url: url })
    // if the url is not existing in the db, create it
    if (existingUrl) {
      res.json({ original_url: existingUrl.original_url, short_url: existingUrl.short_url })
    } else {
      let newUrlShort
      const latestEntry = await ShortUrl.find().sort({ _id: -1 }).limit(1)
      console.log(`log latestEntry: ${latestEntry} 111111`)
      if (latestEntry) {
        newUrlShort = latestEntry.short_url += 1
      }
      newUrlShort = 1
      const shortUrl = new ShortUrl({
        original_url: url,
        short_url: newUrlShort
      })
      await shortUrl.save()
      res.json(shortUrl)
    }
  } catch (err) { // catch error
    console.error(err)
    res.status(500).json('Server Error.')
  }
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
