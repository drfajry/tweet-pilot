const router = require('express').Router();
const { getDb } = require('../services/db');

// POST /api/schedule - جدولة تغريدة
router.post('/', (req, res) => {
  const { content, affiliateUrl, trends, scheduledAt } = req.body;
  if (!content || !scheduledAt) {
    return res.status(400).json({ success: false, error: 'content و scheduledAt مطلوبان' });
  }

  try {
    const db = getDb();
    const result = db.prepare(`
      INSERT INTO scheduled_tweets (content, affiliate_url, trends, scheduled_at)
      VALUES (?, ?, ?, ?)
    `).run(content, affiliateUrl || '', JSON.stringify(trends || []), scheduledAt);

    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/schedule - قائمة المجدولة
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const rows = db.prepare(`
      SELECT * FROM scheduled_tweets ORDER BY scheduled_at ASC
    `).all();
    res.json({ success: true, scheduled: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/schedule/:id - حذف مجدولة
router.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    db.prepare(`DELETE FROM scheduled_tweets WHERE id=? AND status='pending'`).run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
