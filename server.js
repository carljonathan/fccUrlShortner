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

app.post('/api/shorturl/newUrl', async (req, res) => {
  // take request (original URL) by POST
  const url = req.body.url

  // try to find existing Url in db
  try {
    const existingUrl = await ShortUrl.findOne({ original_url: url })
    // if the url is not existing in the db, create it
    if (!existingUrl) {
      let newUrlShort
      const latestEntry = await ShortUrl.find().sort({ _id: -1 }).limit(1).exec()
      if (!latestEntry) {
        newUrlShort = 1
      } else {
        newUrlShort = latestEntry.short_url++
      }
      const shortUrl = new ShortUrl({
        original_url: url,
        short_url: newUrlShort
      })
      await shortUrl.save()
      res.json(shortUrl)
    } else {
      res.json(existingUrl)
    }
  }
  // catch error
  catch (err) {
    console.error(err)
  }
  /*
  if (!result) {
    async function findLatestAndCreate (done) {
      let newShort
      const latestDoc = await ShortUrl.find().sort({ _id: -1 }).limit(1).exec((err, result) => {
        if (err) console.error(err)
        done(null, result)
      })
      console.log(`latestDoc: ${latestDoc}`)
      if (!latestDoc) newShort = 1
      newShort = latestDoc.shortUrl++
      console.log(`newShort: ${newShort}`)
      res.json({ latestDoc: latestDoc, newShort: newShort })
      //const shortUrl = new ShortUrl({ original_url: url, short_url: newShort })
      shortUrl.save((err, data) => {
        if (err) console.error(err)
        done(null, data)
      //res.json(shortUrl)
      //})
    }
  } else { // if the doc is present
    res.json(result)
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
