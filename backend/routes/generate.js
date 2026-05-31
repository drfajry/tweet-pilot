const router = require('express').Router();

router.post('/', async (req, res) => {
  res.json({ success: false, error: 'use_frontend' });
});

module.exports = router;
