const express = require('express');
const { chromium } = require('playwright');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('SkyGeek Marketplace Backend - Visit /products for AkzoNobel items');
});

app.get('/products', async (req, res) => {
  let browser;
  try {
    console.log('Launching Playwright...');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    const page = await browser.newPage();
    console.log('Navigating to https://skygeek.com/akzonobel/...');
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124'
    });
    await page.goto('https://skygeek.com/akzonobel/', { waitUntil: 'networkidle', timeout: 240000 });
    console.log('Page loaded, evaluating content...');

    const products = await page.evaluate(() => {
      const items = [];
      document.querySelectorAll('article.card').forEach(article => {
        const sku = article.getAttribute('data-sku');
        const name = article.querySelector('h4.card-title a')?.textContent.trim() || 'No Name';
        const price = article.querySelector('.price--withoutTax')?.textContent.trim() || 'No Price';
        const href = article.querySelector('a')?.getAttribute('href') || '';
        const imgSrc = article.querySelector('img.card-image')?.getAttribute('src') || '';
        if (sku && name && price) {
          items.push({ sku, name, price, url: href.startsWith('http') ? href : `https://skygeek.com${href}`, image: imgSrc.startsWith('//') ? `https:${imgSrc}` : imgSrc });
        }
      });
      return items;
    });

    console.log('Found products:', products.length, products);
    res.json(products);
  } catch (error) {
    console.error('Scraping error:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ error: 'Scraping failed', details: error.message });
  } finally {
    if (browser) {
      console.log('Closing browser...');
      await browser.close();
    }
  }
});

app.get('/search', async (req, res) => {
  res.status(501).json({ error: 'Search not implemented yet' });
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});