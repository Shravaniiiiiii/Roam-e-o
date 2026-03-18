const router   = require('express').Router();
const { Op }   = require('sequelize');
const auth     = require('../middleware/auth');
const Trip     = require('../models/Trip');

// GET /api/trips
router.get('/', auth, async (req, res) => {
  try {
    const { destination, region, page = 1, limit = 20 } = req.query;
    const where = { user_id: req.user.id };
    if (destination) where.destination = { [Op.like]: `%${destination}%` };
    if (region)      where.region = region;

    const { count, rows } = await Trip.findAndCountAll({
      where,
      attributes: ['id','destination','tagline','dest_emoji','region',
                   'days_count','budget','travellers','travel_style',
                   'created_at','season','is_edited'],
      order:  [['created_at', 'DESC']],
      offset: (page - 1) * limit,
      limit:  parseInt(limit)
    });

    res.json({ trips: rows, total: count, page: parseInt(page), pages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/trips/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const trip = await Trip.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/trips/:id — edit tagline or notes
router.patch('/:id', auth, async (req, res) => {
  try {
    const allowed = ['tagline', 'budget', 'insider_tips'];
    const updates = { is_edited: true };
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const [affected] = await Trip.update(updates, {
      where: { id: req.params.id, user_id: req.user.id }
    });
    if (!affected) return res.status(404).json({ message: 'Trip not found' });

    const trip = await Trip.findByPk(req.params.id);
    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/trips/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Trip.destroy({ where: { id: req.params.id, user_id: req.user.id } });
    if (!deleted) return res.status(404).json({ message: 'Trip not found' });
    res.json({ message: 'Trip deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;