export interface HealthCamp {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  location: string;
  ward: string;
  date: string;
  seats_available: number;
  image: string;
  created_at: string;
  is_active: boolean;
  registrations_count: number;
  tags: string[];
  contact_info: string;
  // Map coordinates (Bareilly, UP)
  latitude: number;
  longitude: number;
}

export const MOCK_HEALTH_CAMPS: HealthCamp[] = [
  {
    id: 'mock-1',
    title: 'Free Cardiology Checkup Camp',
    description:
      'Our specialized cardiology team will be providing free ECG, blood pressure monitoring, and expert consultations for all citizens. Heart health is vital, and early detection can save lives. Join us for a comprehensive screening and guidance on a heart-healthy lifestyle.',
    category: 'Healthcare',
    subcategory: 'Cardiology',
    location: 'Civil Lines Community Center',
    ward: 'Ward 12',
    date: '2026-04-15T09:00:00Z',
    seats_available: 45,
    image:
      'https://images.unsplash.com/photo-1576091160550-217359f4ecf8?auto=format&fit=crop&w=800&q=80',
    created_at: new Date().toISOString(),
    is_active: true,
    registrations_count: 120,
    tags: ['HeartHealth', 'FreeCheckup', 'Cardiology'],
    contact_info: '+91 98765 43210',
    latitude: 28.367,
    longitude: 79.4304,
  },
  {
    id: 'mock-2',
    title: 'Mega Eye Care & Vision Camp',
    description:
      "Protect your vision with our Mega Eye Camp. We offer free vision testing, cataract screening, and distribution of subsidized spectacles. Experienced ophthalmologists will be available for consultations. Don't let poor vision hold you back!",
    category: 'Healthcare',
    subcategory: 'Ophthalmology',
    location: 'Kutchery Road Public Library Grounds',
    ward: 'Ward 08',
    date: '2026-04-20T10:00:00Z',
    seats_available: 12,
    image:
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    created_at: new Date().toISOString(),
    is_active: true,
    registrations_count: 85,
    tags: ['EyeCare', 'Vision', 'FreeCataractScreening'],
    contact_info: '+91 98765 11111',
    latitude: 28.3593,
    longitude: 79.4147,
  },
  {
    id: 'mock-3',
    title: 'Women & Child Wellness Fair',
    description:
      'A holistic health camp dedicated to the well-being of women and children. Specialized care in prenatal advice, child nutrition, immunization screening, and general wellness. We believe in empowering families through health education and accessible care.',
    category: 'Wellness',
    subcategory: 'Pediatrics & Gynecology',
    location: 'Subhash Nagar Government School',
    ward: 'Ward 05',
    date: '2026-05-02T09:00:00Z',
    seats_available: 60,
    image:
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    created_at: new Date().toISOString(),
    is_active: true,
    registrations_count: 210,
    tags: ['MaternalHealth', 'ChildCare', 'Nutrition'],
    contact_info: '+91 98765 22222',
    latitude: 28.3821,
    longitude: 79.4162,
  },
  {
    id: 'mock-4',
    title: 'Dental Hygiene & Oral Health Camp',
    description:
      'Smile brighter with our free dental checkup camp. Services include scaling consultation, cavity screening, and free distribution of oral hygiene kits for children. Professional dentists will provide guidance on maintaining lifelong oral health.',
    category: 'Healthcare',
    subcategory: 'Dentistry',
    location: 'Rampur Garden Municipal Office Hall',
    ward: 'Ward 03',
    date: '2026-05-10T09:30:00Z',
    seats_available: 30,
    image:
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
    created_at: new Date().toISOString(),
    is_active: true,
    registrations_count: 55,
    tags: ['DentalHealth', 'Smile', 'OralHygiene'],
    contact_info: '+91 98765 33333',
    latitude: 28.3509,
    longitude: 79.4305,
  },
  {
    id: 'mock-5',
    title: 'Digital Literacy & Skill Training',
    description:
      'Empower yourself with digital skills! Free training in basic computer operation, internet usage, and mobile banking. Open for all age groups. Certificates will be provided upon completion.',
    category: 'Education',
    subcategory: 'Digital Skills',
    location: 'Pilibhit Bypass Vocational Centre',
    ward: 'Ward 15',
    date: '2026-05-18T10:00:00Z',
    seats_available: 50,
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    created_at: new Date().toISOString(),
    is_active: true,
    registrations_count: 95,
    tags: ['DigitalIndia', 'SkillDevelopment', 'FreeTraining'],
    contact_info: '+91 98765 44444',
    latitude: 28.375,
    longitude: 79.405,
  },
  {
    id: 'mock-6',
    title: 'Community Kitchen & Food Drive',
    description:
      'A community initiative to provide nutritious meals, ration kits, and awareness about balanced diets to underprivileged families in Bareilly. Volunteers are welcome to join and contribute.',
    category: 'Community',
    subcategory: 'Food Security',
    location: 'Izatnagar Welfare Ground',
    ward: 'Ward 20',
    date: '2026-06-01T08:00:00Z',
    seats_available: 200,
    image:
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
    created_at: new Date().toISOString(),
    is_active: true,
    registrations_count: 310,
    tags: ['CommunityService', 'FoodDrive', 'Bareilly'],
    contact_info: '+91 98765 55555',
    latitude: 28.3635,
    longitude: 79.448,
  },
];
