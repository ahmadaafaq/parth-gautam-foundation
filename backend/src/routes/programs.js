const express = require('express');
const router = express.Router();
const supabase = require('../db');

// GET /api/programs?category=&ward=
router.get('/', async (req, res, next) => {
  try {
    const { category, ward } = req.query;

    let query = supabase.from('programs').select('*');

    if (category) query = query.eq('category', category);
    if (ward) query = query.eq('ward', ward);

    const { data, error } = await query.order('created_at', { ascending: false }).limit(100);
    if (error) throw error;

    return res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/programs
router.post('/', async (req, res, next) => {
  try {
    const { title, description, category, subcategory, location, ward, date, seats_available, image, latitude, longitude } = req.body;

    const { data: program, error } = await supabase
      .from('programs')
      .insert([{ title, description, category, subcategory, location, ward, date, seats_available, image, latitude, longitude }])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json(program);
  } catch (err) {
    next(err);
  }
});

// GET /api/programs/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: program, error } = await supabase
      .from('programs')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !program) {
      return res.status(404).json({ detail: 'Program not found' });
    }

    return res.json(program);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
