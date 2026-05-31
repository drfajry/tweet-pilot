const cron = require('node-cron');
const { getDb } = require('./db');
const { getClient } = require('./twitter');

function init() {
  // Check every minute for scheduled tweets
  cron.schedule('* * * * *', async () => {
    const db = getDb();
    const now = new Date().toISOString();

    const pending = db.prepare(`
      SELECT * FROM scheduled_tweets
      WHERE status = 'pending' AND scheduled_at <= ?
    `).all(now);

    for (const tweet of pending) {
      try {
        const client = getClient();
        const result = await client.v2.tweet(tweet.content);

        db.prepare(`
          UPDATE scheduled_tweets SET status='posted', tweet_id=? WHERE id=?
        `).run(result.data.id, tweet.id);

        db.prepare(`
          INSERT INTO tweet_history (content, tweet_id, trends, affiliate_url, status)
          VALUES (?, ?, ?, ?, 'posted')
        `).run(tweet.content, result.data.id, tweet.trends, tweet.affiliate_url);

        console.log(`✅ Scheduled tweet posted: ${result.data.id}`);
      } catch (err) {
        db.prepare(`
          UPDATE scheduled_tweets SET status='failed', error=? WHERE id=?
        `).run(err.message, tweet.id);
        console.error(`❌ Failed to post scheduled tweet ${tweet.id}:`, err.message);
      }
    }
  });

  console.log('📅 Scheduler initialized');
}

module.exports = { init };
