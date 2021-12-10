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

  // try to find existing Url in db or create a new entry
  try {
    // check if the entry already exisits in the db
    const existingUrl = await ShortUrl.findOne({ original_url: url })
    // if the url is n the db, return it as json
    if (existingUrl) {
      res.json({ original_url: existingUrl.original_url, short_url: existingUrl.short_url })
      // if the url does not already exisit, create it
    } else {
      // create var to hold shortened url as number
      let newUrlShort
      // try to get the latest entry in the db
      const latestEntry = await ShortUrl.find().sort({ _id: -1 }).limit(1)
      // if it exists, take it's shortened url and ++
      console.log('1:', latestEntry, '2:', latestEntry.short_url)
      if (latestEntry) {
        newUrlShort = latestEntry.short_url++
      } else {
        // if it doesn't exist, assign 1 as the first entry's short url
        newUrlShort = 1
      }
      if (!isNaN(newUrlShort)) {
        // create new entry
        const shortUrl = new ShortUrl({
          original_url: url,
          short_url: newUrlShort
        })
        // save it
        await shortUrl.save()
        // return the new entry
        res.json({ original_url: shortUrl.original_url, short_url: shortUrl.short_url })
      } else {
        res.status(500).json('Short URL may not be NaN')
      }
    }
  } catch (err) { // catch error, log it and return it.
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
