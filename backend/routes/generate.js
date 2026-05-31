const router = require('express').Router();
const axios = require('axios');

const TONE_MAP = {
  hype:        'مثير ومشوق يجعل القارئ يشعر بالإثارة',
  informative: 'معلوماتي وموثوق يبني الثقة',
  funny:       'فكاهي وخفيف الظل مع لمسة ذكاء',
  urgency:     'عاجل وإلحاحي يحث على اتخاذ قرار سريع',
};

// POST /api/generate
router.post('/', async (req, res) => {
  const { trends, affiliateUrl, productDesc, tone } = req.body;

  if (!affiliateUrl || !trends?.length) {
    return res.status(400).json({ success: false, error: 'trends و affiliateUrl مطلوبان' });
  }

  const trendNames = trends.map(t => t.name).join('، ');
  const toneDesc   = TONE_MAP[tone] || TONE_MAP.hype;

  const prompt = `أنت خبير تسويق رقمي عربي محترف متخصص في تويتر/X.
اكتب تغريدة واحدة فقط باللغة العربية.
الشروط الصارمة:
- الطول: بين 200-270 حرف بالضبط (عدّ الحروف بدقة)
- الأسلوب: ${toneDesc}
- استخدم هذه الترندات بشكل طبيعي: ${trendNames}
- أدرج هذا الرابط: ${affiliateUrl}
- المنتج/الخدمة: ${productDesc || 'منتج مميز'}
- ضع الهاشتاقات في النهاية فقط (2-3 هاشتاق)
- اجعل التغريدة تبدو طبيعية وإنسانية وليست إعلاناً مكشوفاً
- استخدم 2-3 إيموجي مناسبة فقط
- لا تكتب أي شرح أو مقدمة، فقط نص التغريدة مباشرة`;

  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
      }
    );

    const text = response.data.content?.map(i => i.text || '').join('').trim();
    res.json({ success: true, tweet: text });
  } catch (err) {
    console.error('Generate error:', err.response?.data || err.message);
    res.status(500).json({ success: false, error: 'فشل توليد التغريدة' });
  }
});

module.exports = router;
