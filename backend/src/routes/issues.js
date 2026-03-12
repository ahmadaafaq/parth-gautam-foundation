const express = require('express');
const router = express.Router();
const supabase = require('../db');

// POST /api/issues
router.post('/', async (req, res, next) => {
  try {
    const { user_id, issue_type, description, location, ward, image, latitude, longitude } = req.body;

    const { data: issue, error } = await supabase
      .from('issues')
      .insert([{ user_id, issue_type, description, location, ward, image, latitude, longitude, status: 'pending' }])
      .select()
      .single();

    if (error) throw error;

    // Increment community_reports for the user
    await supabase.rpc('increment_community_reports', { uid: user_id });

    return res.status(201).json(issue);
  } catch (err) {
    next(err);
  }
});

// GET /api/issues?ward=&status=
router.get('/', async (req, res, next) => {
  try {
    const { ward, status } = req.query;

    let query = supabase.from('issues').select('*');

    if (ward) query = query.eq('ward', ward);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('created_at', { ascending: false }).limit(100);
    if (error) throw error;

    return res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
