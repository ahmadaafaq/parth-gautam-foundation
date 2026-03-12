const express = require('express');
const router = express.Router();
const supabase = require('../db');

// GET /api/updates?ward=
router.get('/', async (req, res, next) => {
  try {
    const updates = [];

    // Last 3 resolved issues
    const { data: resolvedIssues } = await supabase
      .from('issues')
      .select('id, issue_type, ward, created_at')
      .eq('status', 'resolved')
      .order('created_at', { ascending: false })
      .limit(3);

    if (resolvedIssues) {
      for (const issue of resolvedIssues) {
        const date = new Date(issue.created_at);
        updates.push({
          type: 'resolved_issue',
          title: `${issue.issue_type} resolved in Ward ${issue.ward}`,
          date: date.toLocaleDateString('en-IN', { month: 'long', day: 'numeric' }),
          id: issue.id,
        });
      }
    }

    // Last 3 programs
    const { data: programs } = await supabase
      .from('programs')
      .select('id, title, date, created_at')
      .order('created_at', { ascending: false })
      .limit(3);

    if (programs) {
      for (const program of programs) {
        updates.push({
          type: 'program',
          title: program.title,
          date: program.date || 'Soon',
          id: program.id,
        });
      }
    }

    return res.json(updates);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
