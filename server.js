require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose')
const url = require('url')

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
  // TODO - MAKE SURE URL IS VALID
  // take request (original URL) by POST
  const input = req.body.url
  function isValidUrl(s) {
    try {
      const myUrl = new URL(s)
      console.log('myurl:', myUrl)
      if (myUrl.protocol && myUrl.hostname.includes('.')) {
        let index = myUrl.indexOf('/')
        console.log("index:", index)
        const dot = index += 5
        console.log('dot:', dot)
        if (dot === '.') {
          const start = index += 2
          const finish = index += 4
          const sliced = myUrl.slice(start, finish)
          console.log('start:', start, 'finish:', finish, 'substr:', sliced)
          if (sliced.includes('www')) {
            return true
          }
          return false
        }
        return true
      }
      return false
    } catch (err) {
      return false
    }
  }

  if (isValidUrl(input) === false) {
    res.json({ error: 'invalid url' })
  } else {
    // try to find existing Url in db or create a new entry
    try {
      // check if the entry already exisits in the db
      const existingUrl = await ShortUrl.findOne({ original_url: input })
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
        if (latestEntry) {
          newUrlShort = latestEntry[0].short_url += 1
        } else {
          // if it doesn't exist, assign 1 as the first entry's short url
          newUrlShort = 1
        }
        // make sure the new url short is a number
        if (!isNaN(newUrlShort)) {
          // create new entry
          const shortUrl = new ShortUrl({
            original_url: input,
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
  }
})

app.get('/api/shorturl/:short_url?', async (req, res) => {
  // try to find dbentry and catch if error
  try {
    // check db for entry with matching short url
    const originalUrl = await ShortUrl.findOne({ short_url: req.params.short_url })
    // if found => redirect to original url
    if (originalUrl) {
      return res.redirect(originalUrl.original_url)
    } else {
      // else => json response "no short url found for given input"
      return res.status(400).json('Shortened URL not found, please try another')
    }
  } catch (err) { // catch error, log it and return status 500
    console.error(err)
    res.status(500).json('Server Error')
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
