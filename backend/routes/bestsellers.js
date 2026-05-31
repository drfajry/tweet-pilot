const router = require('express').Router();
const https = require('https');

function fetchUrl(hostname, path) {
  return new Promise((resolve) => {
    const options = {
      hostname,
      path,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ar-SA,ar;q=0.9,en;q=0.8',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
      },
      timeout: 12000,
    };
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });
    req.on('error', () => resolve(''));
    req.on('timeout', () => { req.destroy(); resolve(''); });
    req.end();
  });
}

// ── أمازون السعودية ──
async function fetchAmazon() {
  const html = await fetchUrl('www.amazon.sa', '/gp/bestsellers/?ref_=nav_em_cs_bestsellers_0_1_1_2');
  if (!html) return null;
  const matches = [...html.matchAll(/class="p13n-sc-truncate[^"]*"[^>]*>([^<]{5,80})<\/span>[\s\S]{0,300}?class="p13n-sc-price"[^>]*>([^<]+)</g)];
  const products = matches.slice(0, 10).map((m, i) => ({
    id: i + 1,
    name: m[1].trim(),
    price: m[2].trim(),
    currency: 'SAR',
    source: 'amazon',
    url: 'https://www.amazon.sa/gp/bestsellers/',
  }));
  return products.length ? products : null;
}

// ── نون ──
async function fetchNoon() {
  const html = await fetchUrl('www.noon.com', '/saudi-ar/bestsellers/');
  if (!html) return null;
  const matches = [...html.matchAll(/"name":"([^"]{5,80})","brand":"([^"]*)"[^}]*"price":\{"value":(\d+)/g)];
  const products = matches.slice(0, 10).map((m, i) => ({
    id: i + 1,
    name: m[1],
    brand: m[2] || '',
    price: parseInt(m[3]) + ' SAR',
    currency: 'SAR',
    source: 'noon',
    url: 'https://www.noon.com/saudi-ar/bestsellers/',
  }));
  return products.length ? products : null;
}

// ── علي إكسبريس ──
async function fetchAliExpress() {
  const html = await fetchUrl('www.aliexpress.com', '/ssr/300002660/Deals-HomePage?disableNav=YES');
  if (!html) return null;
  const matches = [...html.matchAll(/"title":"([^"]{5,80})"[^}]*"price":"([^"]+)"/g)];
  const products = matches.slice(0, 10).map((m, i) => ({
    id: i + 1,
    name: m[1].trim(),
    price: m[2].trim(),
    currency: 'USD',
    source: 'aliexpress',
    url: 'https://www.aliexpress.com/ssr/300002660/Deals-HomePage',
  }));
  return products.length ? products : null;
}

// ── منتجات افتراضية ──
function getMock(source) {
  const mock = {
    amazon: [
      { id:1, name:'سماعات AirPods Pro', brand:'Apple', price:'799 SAR', source:'amazon', url:'https://www.amazon.sa/gp/bestsellers/' },
      { id:2, name:'شاشة 4K للألعاب', brand:'LG', price:'1299 SAR', source:'amazon', url:'https://www.amazon.sa/gp/bestsellers/' },
      { id:3, name:'كاميرا ويب HD', brand:'Logitech', price:'299 SAR', source:'amazon', url:'https://www.amazon.sa/gp/bestsellers/' },
      { id:4, name:'ماوس لاسلكي', brand:'Logitech', price:'149 SAR', source:'amazon', url:'https://www.amazon.sa/gp/bestsellers/' },
      { id:5, name:'كيبورد ميكانيكي', brand:'Redragon', price:'249 SAR', source:'amazon', url:'https://www.amazon.sa/gp/bestsellers/' },
      { id:6, name:'شاحن لاسلكي سريع', brand:'Anker', price:'129 SAR', source:'amazon', url:'https://www.amazon.sa/gp/bestsellers/' },
    ],
    noon: [
      { id:1, name:'سماعات بلوتوث لاسلكية', brand:'Samsung', price:'299 SAR', source:'noon', url:'https://www.noon.com/saudi-ar/bestsellers/' },
      { id:2, name:'ساعة ذكية رياضية', brand:'Xiaomi', price:'449 SAR', source:'noon', url:'https://www.noon.com/saudi-ar/bestsellers/' },
      { id:3, name:'شاحن سريع USB-C', brand:'Anker', price:'89 SAR', source:'noon', url:'https://www.noon.com/saudi-ar/bestsellers/' },
      { id:4, name:'مكيف هواء محمول', brand:'Sharp', price:'1299 SAR', source:'noon', url:'https://www.noon.com/saudi-ar/bestsellers/' },
      { id:5, name:'عطر رجالي فاخر', brand:'Armaf', price:'179 SAR', source:'noon', url:'https://www.noon.com/saudi-ar/bestsellers/' },
      { id:6, name:'مكبر صوت بلوتوث', brand:'JBL', price:'349 SAR', source:'noon', url:'https://www.noon.com/saudi-ar/bestsellers/' },
    ],
    aliexpress: [
      { id:1, name:'إضاءة LED للغرفة', brand:'Generic', price:'$5.99', source:'aliexpress', url:'https://www.aliexpress.com/ssr/300002660/Deals-HomePage' },
      { id:2, name:'حامل هاتف للسيارة', brand:'Generic', price:'$3.99', source:'aliexpress', url:'https://www.aliexpress.com/ssr/300002660/Deals-HomePage' },
      { id:3, name:'ساعة ذكية رياضية', brand:'Generic', price:'$15.99', source:'aliexpress', url:'https://www.aliexpress.com/ssr/300002660/Deals-HomePage' },
      { id:4, name:'سماعات TWS', brand:'Generic', price:'$8.99', source:'aliexpress', url:'https://www.aliexpress.com/ssr/300002660/Deals-HomePage' },
      { id:5, name:'شاحن محمول 20000mAh', brand:'Generic', price:'$12.99', source:'aliexpress', url:'https://www.aliexpress.com/ssr/300002660/Deals-HomePage' },
      { id:6, name:'كابل USB-C سريع', brand:'Generic', price:'$2.99', source:'aliexpress', url:'https://www.aliexpress.com/ssr/300002660/Deals-HomePage' },
    ],
  };
  return mock[source] || mock.noon;
}

// GET /api/bestsellers?source=noon|amazon|aliexpress
router.get('/', async (req, res) => {
  const source = req.query.source || 'noon';
  try {
    let products;
    if (source === 'amazon') products = await fetchAmazon();
    else if (source === 'aliexpress') products = await fetchAliExpress();
    else products = await fetchNoon();

    if (!products || products.length === 0) products = getMock(source);
    res.json({ success: true, source, products });
  } catch(err) {
    res.json({ success: true, source, products: getMock(source) });
  }
});

module.exports = router;
