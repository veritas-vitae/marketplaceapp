const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('SkyGeek Marketplace Backend - Visit /products or /search?q=<query>');
});

app.get('/products', async (req, res) => {
  try {
    const { data: html } = await axios.get('https://skygeek.com/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124' }
    });
    const $ = cheerio.load(html);
    const skus = [];
    // Adjust selector based on inspection (e.g., data-sku attribute)
    $('.product').each((i, el) => {
      const sku = $(el).attr('data-sku') || $(el).find('a').attr('href')?.match(/sellingSku=([^&]+)/)?.[1];
      if (sku) skus.push(sku);
    });
    console.log('Found SKUs:', skus.length, skus); // Debug log

    const products = [];
    for (const sku of skus.slice(0, 5)) { // Limit to 5 for PoC
      try {
        const { data } = await axios.get(`https://api.skygeek.com/PublicApis/api/v0/SkyGeekDotComApi/SellingSkuData?sellingSku=${sku}`, {
          headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://skygeek.com/', 'Origin': 'https://skygeek.com' }
        });
        products.push({
          name: data.name || 'No Name',
          price: data.price || 'No Price',
          url: `https://skygeek.com/product/${sku}` // Construct URL
        });
        console.log(`Fetched product for SKU ${sku}:`, { name: data.name, price: data.price });
      } catch (error) {
        console.error(`API error for SKU ${sku}:`, error.message);
      }
    }
    res.json(products);
  } catch (error) {
    console.error('Scraping error:', error.message);
    res.status(500).json({ error: 'Scraping failed' });
  }
});

app.get('/search', async (req, res) => {
  const query = req.query.q;
  try {
    const { data: html } = await axios.get('https://skygeek.com/', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(html);
    const skus = [];
    $('.product').each((i, el) => {
      const sku = $(el).attr('data-sku') || $(el).find('a').attr('href')?.match(/sellingSku=([^&]+)/)?.[1];
      if (sku) skus.push(sku);
    });
    console.log('Found SKUs for search:', skus.length, skus);

    const products = skus
      .slice(0, 5) // Limit for PoC
      .map(async sku => {
        try {
          const { data } = await axios.get(`https://api.skygeek.com/PublicApis/api/v0/SkyGeekDotComApi/SellingSkuData?sellingSku=${sku}`, {
            headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://skygeek.com/', 'Origin': 'https://skygeek.com' }
          });
          return {
            name: data.name || 'No Name',
            price: data.price || 'No Price',
            url: `https://skygeek.com/product/${sku}`
          };
        } catch (error) {
          console.error(`API error for SKU ${sku}:`, error.message);
          return null;
        }
      });
    const results = (await Promise.all(products)).filter(p => p);
    res.json(results);
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ error: 'Search failed' });
  }
});

const PORT = process.env.PORT;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});