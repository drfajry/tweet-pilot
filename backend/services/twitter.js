const { TwitterApi } = require('twitter-api-v2');

function getClient() {
  const required = ['X_API_KEY', 'X_API_SECRET', 'X_ACCESS_TOKEN', 'X_ACCESS_SECRET'];
  for (const key of required) {
    if (!process.env[key]) throw new Error(`Missing env variable: ${key}`);
  }
  return new TwitterApi({
    appKey:       process.env.X_API_KEY,
    appSecret:    process.env.X_API_SECRET,
    accessToken:  process.env.X_ACCESS_TOKEN,
    accessSecret: process.env.X_ACCESS_SECRET,
  });
}

function getBearerClient() {
  if (!process.env.X_BEARER_TOKEN) throw new Error('Missing X_BEARER_TOKEN');
  return new TwitterApi(process.env.X_BEARER_TOKEN);
}

module.exports = { getClient, getBearerClient };
