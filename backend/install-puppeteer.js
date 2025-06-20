const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browserFetcher = puppeteer.createBrowserFetcher();
  const revisionInfo = await browserFetcher.download('137.0.7151.119');
  const localChromePath = revisionInfo.executablePath;
  fs.chmodSync(localChromePath, 0o755); // Ensure executable permissions
  console.log('Chrome installed at:', localChromePath);
})();