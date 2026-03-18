const router = require('express').Router();
const Groq   = require('groq-sdk');
const auth   = require('../middleware/auth');
const Trip   = require('../models/Trip');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/generate
router.post('/', auth, async (req, res) => {
  const { dest, days, budget, travellers, style, stay, dest_emoji } = req.body;
  if (!dest || !days || !budget)
    return res.status(400).json({ message: 'dest, days and budget are required' });

  const daysNum    = Math.min(parseInt(days), 10);
  const actsPerDay = daysNum <= 5 ? 4 : 3;

  const prompt = `You are an expert India travel planner. Return ONLY raw valid JSON, no markdown, no backticks.

Destination: ${dest}
Duration: ${daysNum} days
Budget: INR ${budget} total
Travellers: ${travellers || 'couple'}
Travel Style: ${style || 'balanced'}
Stay Preference: ${stay || 'midrange'}

Return exactly this JSON structure. All strings SHORT (1 sentence max):
{
  "destination": "City, State",
  "tagline": "short poetic tagline",
  "dest_emoji": "${dest_emoji || '📍'}",
  "region": "North/South/East/West/Central/Northeast/Islands",
  "language": "local language(s)",
  "season": {
    "icon": "emoji", "best_time": "e.g. Oct-Feb", "current_advice": "one sentence.",
    "rating": "IDEAL or GOOD or AVOID", "temperature": "e.g. 15-28C", "monsoon": "e.g. Jun-Sep"
  },
  "quick_facts": {
    "best_for": "e.g. Heritage", "famous_food": "2-3 dishes",
    "transport": "main local transport", "budget_level": "Budget/Mid-range/Luxury"
  },
  "budget_breakdown": {
    "accommodation": 0, "food": 0, "transport": 0,
    "activities": 0, "shopping": 0, "misc": 0, "total": 0, "per_day": 0
  },
  "days": [
    { "day": 1, "theme": "Day theme", "subtitle": "teaser",
      "estimated_cost": 0, "transport_tip": "tip",
      "activities": [
        { "time": "09:00", "name": "place", "description": "one sentence.",
          "type": "activity or food or hidden or stay", "cost": 0, "tip": "local tip." }
      ]
    }
  ],
  "reels": [
    { "id": 1, "title": "title", "type": "hidden or food or activity",
      "emoji": "emoji", "description": "one sentence.",
      "search_query": "youtube search", "instagram_tag": "#hashtag" }
  ],
  "insider_tips": [ { "icon": "emoji", "title": "title", "detail": "one sentence." } ],
  "local_phrases": [ { "phrase": "phrase", "meaning": "meaning", "language": "lang" } ]
}

RULES: Exactly ${daysNum} days with ${actsPerDay} activities each. Exactly 9 reels (3 hidden, 3 food, 3 activity). Exactly 6 insider_tips. Exactly 4 local_phrases. All costs numbers. OUTPUT ONLY JSON.`;

  try {
    const start    = Date.now();
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are an India travel expert. Return ONLY valid raw JSON.' },
        { role: 'user',   content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens:  8000
    });
    const genTime = Date.now() - start;
    const plan    = JSON.parse(response.choices[0].message.content);

    // Save to MySQL via Sequelize
    const trip = await Trip.create({
      user_id:      req.user.id,
      destination:  plan.destination || dest,
      tagline:      plan.tagline,
      dest_emoji:   plan.dest_emoji || dest_emoji || '📍',
      region:       plan.region,
      language:     plan.language,
      days_count:   daysNum,
      budget:       parseInt(budget),
      travellers:   travellers || 'couple',
      travel_style: style || 'balanced',
      stay_pref:    stay || 'midrange',
      season:           plan.season,
      quick_facts:      plan.quick_facts,
      budget_breakdown: plan.budget_breakdown,
      days:             plan.days,
      reels:            plan.reels,
      insider_tips:     plan.insider_tips,
      local_phrases:    plan.local_phrases
    });

    res.json({ ...plan, id: trip.id, gen_time_ms: genTime });
  } catch (err) {
    console.error('Generate error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;