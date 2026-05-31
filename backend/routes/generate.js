const router = require('express').Router();

const TEMPLATES = {
  hype: [
    `🔥 لا تفوتك هذه الفرصة! {product} بسعر خيالي لن تصدقه\nاطلبه الآن قبل نفاد الكمية 👇\n{url}\n{trends}`,
    `⚡️ عرض انفجاري على {product}!\nهذا هو الوقت المثالي للشراء 🛒\n{url}\n{trends}`,
    `🚀 من يبحث عن {product} هذا هو الرابط الذهبي\nالسعر مش هيتكرر! 💥\n{url}\n{trends}`,
    `😱 صدمة السعر! {product} بخصم لا يُصدق\nاستغل الفرصة الآن 🔥\n{url}\n{trends}`,
  ],
  informative: [
    `📊 إذا كنت تبحث عن {product} فهذا أفضل خيار متاح الآن\nجودة عالية وسعر منافس ✅\n{url}\n{trends}`,
    `💡 نصيحة لمن يريد {product}: هذا المنتج حصل على أعلى التقييمات\nجربه بنفسك 👇\n{url}\n{trends}`,
    `🔍 بعد مقارنة طويلة وجدت أن {product} هو الأفضل في فئته\nالمواصفات والسعر لا يُنافسان 📌\n{url}\n{trends}`,
  ],
  funny: [
    `😂 محفظتي تكرهني بعد ما شفت سعر {product}\nبس مش قادر أقاومه 🤷‍♂️\n{url}\n{trends}`,
    `🤣 أنا وعدت نفسي ما أشتري.. بس {product} بهالسعر؟!\nكذبت على نفسي 😅\n{url}\n{trends}`,
    `😄 كل مرة أقول "آخر مرة أشتري" يطلع عرض على {product}\nالحياة مش عادلة 😩\n{url}\n{trends}`,
  ],
  urgency: [
    `⏰ تنبيه عاجل: {product} بهذا السعر لن يدوم طويلاً\nاشترِ الآن قبل فوات الأوان! 🚨\n{url}\n{trends}`,
    `🚨 آخر ساعات العرض على {product}!\nلا تندم لاحقاً، القرار الآن ⚡️\n{url}\n{trends}`,
    `⌛ ينتهي العرض قريباً! {product} بسعر استثنائي\nلا تتردد، الفرصة لن تتكرر 🔔\n{url}\n{trends}`,
  ],
};

router.post('/', (req, res) => {
  const { trends, affiliateUrl, productDesc, tone } = req.body;

  if (!affiliateUrl || !trends?.length) {
    return res.status(400).json({ success: false, error: 'trends و affiliateUrl مطلوبان' });
  }

  const product   = productDesc || 'هذا المنتج المميز';
  const trendTags = trends.map(t => t.name).join(' ');
  const toneKey   = TEMPLATES[tone] ? tone : 'hype';
  const list      = TEMPLATES[toneKey];
  const template  = list[Math.floor(Math.random() * list.length)];

  const tweet = template
    .replace(/{product}/g, product)
    .replace(/{url}/g, affiliateUrl)
    .replace(/{trends}/g, trendTags);

  res.json({ success: true, tweet });
});

module.exports = router;
