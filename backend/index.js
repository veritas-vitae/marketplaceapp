const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();

app.use(express.json());

// Add root route
app.get('/', (req, res) => {
  res.send('SkyGeek Marketplace Backend - Visit /products or /search?q=<query>');
});

app.get('/products', async (req, res) => {
  try {
    const { data } = await axios.get('https://skygeek.com/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124' }
    });
    const $ = cheerio.load(data);
    const products = [];
    $('.product-grid-item').each((i, el) => {
      const name = $(el).find('.product-title').text().trim();
      const price = $(el).find('.product-price').text().trim();
      const url = $(el).find('a').attr('href');
      if (name && price) products.push({ name, price, url });
    });
    res.json(products);
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ error: 'Scraping failed' });
  }
});

app.get('/search', async (req, res) => {
  const query = req.query.q;
  try {
    const { data } = await axios.get(`https://skygeek.com/search?q=${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(data);
    const results = [];
    $('.search-result-item').each((i, el) => {
      const name = $(el).find('.product-title').text().trim();
      const price = $(el).find('.product-price').text().trim();
      if (name && price) results.push({ name, price });
    });
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

const PORT = process.env.PORT;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});