const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('SkyGeek Marketplace Backend - Visit /products for AkzoNobel items');
});

app.get('/products', async (req, res) => {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124');
    await page.goto('https://skygeek.com/akzonobel/', { waitUntil: 'networkidle2' });

    const products = await page.evaluate(() => {
      const items = [];
      document.querySelectorAll('article.card').forEach(article => {
        const sku = article.getAttribute('data-sku');
        const name = article.querySelector('h4.card-title a')?.textContent.trim() || 'No Name';
        const price = article.querySelector('.price--withoutTax')?.textContent.trim() || 'No Price';
        if (sku && name && price) {
          items.push({ sku, name, price, url: `https://skygeek.com${article.querySelector('a')?.getAttribute('href') || ''}` });
        }
      });
      return items;
    });

    console.log('Found products:', products.length, products);
    res.json(products);
  } catch (error) {
    console.error('Scraping error:', error.message);
    res.status(500).json({ error: 'Scraping failed' });
  } finally {
    if (browser) await browser.close();
  }
});

app.get('/search', async (req, res) => {
  res.status(501).json({ error: 'Search not implemented yet' }); // Placeholder
});

const PORT = process.env.PORT;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});