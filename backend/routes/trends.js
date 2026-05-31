const router = require('express').Router();
const { getBearerClient } = require('../services/twitter');

const REGIONS = {
  sa: { woeid: 23424938, label: 'السعودية' },
  world: { woeid: 1, label: 'العالم' },
  ae: { woeid: 23424738, label: 'الإمارات' },
  eg: { woeid: 23424802, label: 'مصر' },
};

// GET /api/trends?region=sa
router.get('/', async (req, res) => {
  try {
    const regionKey = req.query.region || 'sa';
    const region = REGIONS[regionKey] || REGIONS.sa;

    const client = getBearerClient();

    // X API v1.1 trends (still available)
    const trends = await client.v1.trendsByPlace(region.woeid);
    const list = trends[0]?.trends?.slice(0, 15).map(t => ({
      name: t.name,
      url: t.url,
      tweet_volume: t.tweet_volume,
    })) || [];

    res.json({ success: true, region: region.label, trends: list });
  } catch (err) {
    console.error('Trends error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
