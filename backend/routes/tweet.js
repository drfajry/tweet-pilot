const router = require('express').Router();
const { getClient } = require('../services/twitter');
const { getDb } = require('../services/db');

// POST /api/tweet/post
router.post('/post', async (req, res) => {
  const { content, affiliateUrl, trends } = req.body;
  if (!content) return res.status(400).json({ success: false, error: 'content مطلوب' });

  try {
    const client = getClient();
    const result = await client.v2.tweet(content);

    const db = getDb();
    db.prepare(`
      INSERT INTO tweet_history (content, tweet_id, trends, affiliate_url, status)
      VALUES (?, ?, ?, ?, 'posted')
    `).run(content, result.data.id, JSON.stringify(trends || []), affiliateUrl || '');

    res.json({ success: true, tweetId: result.data.id });
  } catch (err) {
    console.error('Post error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/tweet/history
router.get('/history', (req, res) => {
  try {
    const db = getDb();
    const rows = db.prepare(`
      SELECT * FROM tweet_history ORDER BY posted_at DESC LIMIT 50
    `).all();
    res.json({ success: true, history: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
