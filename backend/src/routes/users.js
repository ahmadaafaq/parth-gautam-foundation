const express = require('express');
const router = express.Router();
const supabase = require('../db');

// GET /api/users/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
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
