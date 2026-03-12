const express = require('express');
const router = express.Router();
const supabase = require('../db');

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, phone, age_group, ward, occupation, interests } = req.body;

    // Check if user already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .single();

    if (existing) {
      return res.status(400).json({ detail: 'User already registered' });
    }

    // Generate citizen ID
    const citizen_id = `BG-${Math.floor(10000 + Math.random() * 90000)}`;

    const { data: user, error } = await supabase
      .from('users')
      .insert([{ name, phone, age_group, ward, occupation, interests, citizen_id }])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { phone } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error || !user) {
      return res.status(404).json({ detail: 'User not found' });
    }

    return res.json(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
