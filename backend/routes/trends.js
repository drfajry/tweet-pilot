const router = require('express').Router();
const googleTrends = require('google-trends-api');

const REGIONS = {
  sa: 'SA',
  world: '',
  ae: 'AE',
  eg: 'EG',
};

router.get('/', async (req, res) => {
  const regionKey = req.query.region || 'sa';
  const geo = REGIONS[regionKey] || 'SA';

  try {
    const result = await googleTrends.dailyTrends({ geo, hl: 'ar' });
    const data = JSON.parse(result);
    const items = data?.default?.trendingSearchesDays?.[0]?.trendingSearches || [];

    const trends = items.slice(0, 12).map(t => ({
      name: '#' + t.title.query.replace(/\s+/g, '_'),
      tweet_volume: parseInt(t.formattedTraffic?.replace(/[^0-9]/g, '') || '0') * 1000,
    }));

    res.json({ success: true, region: regionKey, trends });
  } catch (err) {
    console.error('Google Trends error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
