const router      = require('express').Router();
const PDFDocument = require('pdfkit');
const auth        = require('../middleware/auth');
const Trip        = require('../models/Trip');

// GET /api/export/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const trip = await Trip.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const doc      = new PDFDocument({ margin: 50, size: 'A4' });
    const filename = `roameo-${trip.destination.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    const bb = trip.budget_breakdown || {};
    const s  = trip.season || {};

    // Cover
    doc.rect(0, 0, doc.page.width, 180).fill('#1C1409');
    doc.fill('#FF6B00').font('Helvetica-Bold').fontSize(32).text('Roam-e-o', 50, 50);
    doc.fill('#D4A843').font('Helvetica').fontSize(13).text('AI India Travel Planner', 50, 90);
    doc.fill('#FDF6E3').font('Helvetica-Bold').fontSize(22).text(trip.destination, 50, 120);
    if (trip.tagline) doc.fill('#8B7355').font('Helvetica-Oblique').fontSize(11).text(trip.tagline, 50, 150);

    // Trip meta
    doc.y = 210;
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#FF6B00').text('Trip Overview');
    doc.moveDown(0.4);
    [
      ['Duration',   `${trip.days_count} days`],
      ['Budget',     `Rs.${trip.budget.toLocaleString('en-IN')}`],
      ['Travellers', trip.travellers],
      ['Style',      trip.travel_style],
      ['Stay',       trip.stay_pref || '—'],
      ['Region',     trip.region || '—'],
      ['Language',   trip.language || '—'],
    ].forEach(([k, v]) => {
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#333').text(`${k}: `, { continued: true });
      doc.font('Helvetica').fillColor('#555').text(v);
    });

    // Season
    if (s.best_time) {
      doc.moveDown(0.8);
      doc.font('Helvetica-Bold').fontSize(14).fillColor('#FF6B00').text('Best Time to Visit');
      doc.moveDown(0.3);
      doc.font('Helvetica').fontSize(10).fillColor('#333')
        .text(`${s.best_time}  |  ${s.temperature || ''}  |  Rating: ${s.rating || ''}`);
      if (s.current_advice) doc.text(s.current_advice, { color: '#555' });
    }

    // Budget Breakdown
    if (bb.total) {
      doc.moveDown(0.8);
      doc.font('Helvetica-Bold').fontSize(14).fillColor('#FF6B00').text('Budget Breakdown');
      doc.moveDown(0.3);
      [
        ['Accommodation', bb.accommodation], ['Food & Dining', bb.food],
        ['Transport', bb.transport], ['Activities', bb.activities],
        ['Shopping', bb.shopping],  ['Misc', bb.misc]
      ].filter(([, v]) => v).forEach(([label, val]) => {
        doc.font('Helvetica').fontSize(10).fillColor('#333').text(`${label}: `, { continued: true });
        doc.fillColor('#FF6B00').text(`Rs.${(val || 0).toLocaleString('en-IN')}`);
      });
      doc.moveDown(0.3);
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#D4A843')
        .text(`Total Estimate: Rs.${bb.total.toLocaleString('en-IN')}`);
    }

    // Itinerary
    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(18).fillColor('#FF6B00').text('Day-by-Day Itinerary');
    doc.moveDown(0.5);

    (trip.days || []).forEach(day => {
      if (doc.y > 700) doc.addPage();
      doc.rect(50, doc.y, doc.page.width - 100, 28).fill('#1C1409');
      doc.fill('#FF6B00').font('Helvetica-Bold').fontSize(12)
        .text(`Day ${day.day} — ${day.theme}`, 58, doc.y - 22);
      doc.moveDown(0.5);
      if (day.subtitle) {
        doc.fill('#8B7355').font('Helvetica-Oblique').fontSize(9).text(day.subtitle, { indent: 10 });
      }
      (day.activities || []).forEach(act => {
        doc.moveDown(0.3);
        doc.fill('#FF6B00').font('Helvetica-Bold').fontSize(9)
          .text(`${act.time || ''}  ${act.name}`, { indent: 16, continued: true });
        doc.fill('#888').font('Helvetica').fontSize(8)
          .text(`  [${act.type}]  Rs.${(act.cost || 0).toLocaleString('en-IN')}`);
        doc.fill('#444').font('Helvetica').fontSize(8.5)
          .text(act.description || '', { indent: 28 });
        if (act.tip) doc.fill('#D4A843').font('Helvetica-Oblique').fontSize(8).text(`Tip: ${act.tip}`, { indent: 28 });
      });
      if (day.transport_tip) {
        doc.moveDown(0.3);
        doc.fill('#2D5A3D').font('Helvetica').fontSize(8.5).text(`Transport: ${day.transport_tip}`, { indent: 16 });
      }
      doc.moveDown(0.6);
    });

    // Insider Tips
    if ((trip.insider_tips || []).length) {
      if (doc.y > 650) doc.addPage();
      doc.font('Helvetica-Bold').fontSize(14).fillColor('#FF6B00').text('Insider Tips');
      doc.moveDown(0.3);
      trip.insider_tips.forEach(t => {
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#333').text(`${t.icon}  ${t.title}: `, { continued: true });
        doc.font('Helvetica').fillColor('#555').text(t.detail);
      });
    }

    // Local Phrases
    if ((trip.local_phrases || []).length) {
      doc.moveDown(0.8);
      doc.font('Helvetica-Bold').fontSize(14).fillColor('#FF6B00').text('Useful Local Phrases');
      doc.moveDown(0.3);
      trip.local_phrases.forEach(p => {
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#D4A843').text(`"${p.phrase}"  `, { continued: true });
        doc.font('Helvetica').fillColor('#333').text(p.meaning);
        doc.font('Helvetica-Oblique').fillColor('#888').fontSize(8).text(`(${p.language})`);
      });
    }

    // Footer
    doc.moveDown(2);
    doc.font('Helvetica').fontSize(8).fillColor('#aaa')
      .text(`Generated by Roam-e-o  •  ${new Date().toLocaleDateString()}`, { align: 'center' });

    doc.end();
  } catch (err) {
    console.error('PDF error:', err);
    if (!res.headersSent) res.status(500).json({ message: err.message });
  }
});

module.exports = router;