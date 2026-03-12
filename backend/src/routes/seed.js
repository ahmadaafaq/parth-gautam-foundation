const express = require('express');
const router = express.Router();
const supabase = require('../db');

// POST /api/seed
router.post('/', async (req, res, next) => {
  try {
    // Check if already seeded
    const { count } = await supabase
      .from('programs')
      .select('*', { count: 'exact', head: true });

    if (count > 0) {
      return res.json({ message: 'Database already seeded' });
    }

    const samplePrograms = [
      {
        title: 'Free Health Camp',
        description: 'General health checkup with free medicines',
        category: 'healthcare',
        subcategory: 'health_camp',
        location: 'Ward 12 Community Center',
        ward: '12',
        date: 'Tomorrow 10 AM',
        seats_available: 50,
        latitude: 28.6139,
        longitude: 77.2090,
      },
      {
        title: 'Digital Skills Workshop',
        description: 'Learn basic computer skills and internet usage',
        category: 'education',
        subcategory: 'skill_training',
        location: 'Ward 8 School',
        ward: '8',
        date: 'Next Monday',
        seats_available: 20,
        latitude: 28.6139,
        longitude: 77.2090,
      },
      {
        title: 'Merit Scholarship Program',
        description: 'Scholarships for students scoring above 80%',
        category: 'education',
        subcategory: 'scholarship',
        location: 'All Wards',
        ward: 'all',
        date: 'Apply by March 31',
        seats_available: 100,
        latitude: 28.6139,
        longitude: 77.2090,
      },
      {
        title: 'Community Cleanup Drive',
        description: 'Join us in cleaning public spaces',
        category: 'community',
        subcategory: 'volunteer',
        location: 'City Park',
        ward: '5',
        date: 'This Sunday 7 AM',
        seats_available: 30,
        latitude: 28.6139,
        longitude: 77.2090,
      },
      {
        title: 'Teleconsultation Service',
        description: 'Free online doctor consultations',
        category: 'healthcare',
        subcategory: 'doctor_booking',
        location: 'Online',
        ward: 'all',
        date: 'Available daily',
        seats_available: null,
        latitude: 28.6139,
        longitude: 77.2090,
      },
    ];

    const { error } = await supabase.from('programs').insert(samplePrograms);
    if (error) throw error;

    return res.json({
      message: 'Database seeded successfully',
      programs_added: samplePrograms.length,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
