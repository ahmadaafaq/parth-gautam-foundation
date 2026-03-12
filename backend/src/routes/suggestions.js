const express = require('express');
const router = express.Router();
const supabase = require('../db');

// GET /api/suggestions/:userId
router.get('/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Fetch the user to get interests and ward
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('interests, ward')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ detail: 'User not found' });
    }

    const { interests = [], ward } = user;

    // Find programs matching user interests or ward (union)
    const { data: byInterest } = await supabase
      .from('programs')
      .select('*')
      .in('category', interests.length > 0 ? interests : ['__none__'])
      .limit(5);

    const { data: byWard } = await supabase
      .from('programs')
      .select('*')
      .eq('ward', ward)
      .limit(5);

    // Merge, deduplicate by id, cap at 5
    const seen = new Set();
    const merged = [...(byInterest || []), ...(byWard || [])].filter(p => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    }).slice(0, 5);

    return res.json(merged);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
