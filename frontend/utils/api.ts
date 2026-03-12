import Constants from 'expo-constants';

// Simulated delay to show loading states
const DELAY = 500;
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authAPI = {
  register: async (userData: any) => {
    await sleep(DELAY);
    return {
      status: 'success',
      user: {
        id: 'mock-user-123',
        name: userData.name || 'Test User',
        phone: userData.phone,
        citizen_id: 'C-MOCK-001',
        ward: userData.ward || 'Ward 1',
      },
      token: 'mock-jwt-token'
    };
  },
  login: async (phone: string) => {
    await sleep(DELAY);
    return {
      status: 'success',
      user: {
        id: 'mock-user-123',
        name: 'John Doe',
        phone: phone,
        citizen_id: 'C-MOCK-001',
        ward: 'Ward 1',
      },
      token: 'mock-jwt-token'
    };
  },
};

export const programsAPI = {
  getAll: async (category?: string, ward?: string) => {
    await sleep(DELAY);
    if (category === 'healthcare') {
      return [
        {
          id: 'camp-1',
          title: 'Specialized Dental Camp',
          location: 'Community Center, Ward 7',
          date: 'March 25, 2026',
          seats_available: 45,
          category: 'healthcare',
          description: 'Free dental checkup and consultation with specialized orthodontists.'
        },
        {
          id: 'camp-2',
          title: 'Child Nutrition Workshop',
          location: 'Govt School Hall, Ward 3',
          date: 'April 02, 2026',
          seats_available: 20,
          category: 'healthcare',
          description: 'Educational workshop for parents on balanced diet and nutrition for growing children.'
        }
      ];
    }
    if (category === 'education') {
      return [
        {
          id: 'edu-1',
          title: 'Digital Literacy for Seniors',
          location: 'Library, Ward 5',
          date: 'Ongoing - Mon/Wed',
          seats_available: 12,
          category: 'education',
          subcategory: 'skill_training',
          description: 'Learn to use smartphones, banking apps, and stay safe online.'
        },
        {
          id: 'edu-2',
          title: 'Merit-Based Scholarship 2026',
          location: 'Direct Deposit',
          date: 'Deadline: May 15',
          seats_available: 100,
          category: 'education',
          subcategory: 'scholarship',
          description: 'Financial aid for students scoring above 85% in their final exams.'
        }
      ];
    }
    return [];
  },
  getById: async (id: string) => {
    await sleep(DELAY);
    return {
      id,
      title: 'Mock Program',
      description: 'This is a detailed description for a mock program used during UI design development.',
      location: 'Virtual Office',
      date: 'Available Anytime'
    };
  },
};

export const suggestionsAPI = {
  getForUser: async (userId: string) => {
    await sleep(DELAY);
    return [
      {
        id: 'sug-1',
        category: 'healthcare',
        title: 'Weekly Health Checkup at Ward Clinic',
        location: 'Sector 4 Community Clinic',
        date: 'Every Saturday, 10:00 AM',
        description: 'Get your blood pressure and sugar levels checked for free.'
      },
      {
        id: 'sug-2',
        category: 'education',
        title: 'Advanced Computer Basics for Adults',
        location: 'Ward 1 Learning Center',
        date: 'Starting Next Monday',
        description: 'Master Internet, Word and Excel in just 2 weeks.'
      },
      {
        id: 'sug-3',
        category: 'people',
        title: 'Community Town Hall Meeting',
        location: 'Main Public Hall',
        date: 'Mar 30, 2026',
        description: 'Discuss upcoming ward developments with your representatives.'
      }
    ];
  },
};

export const issuesAPI = {
  create: async (issueData: any) => {
    await sleep(DELAY);
    return { status: 'success', issue_id: 'issue-' + Date.now() };
  },
  getAll: async (ward?: string, status?: string) => {
    await sleep(DELAY);
    return [
      { id: 'iss-1', title: 'Street Light Repair', status: 'In Progress', ward: 'Ward 4' },
      { id: 'iss-2', title: 'Water Pipe Leakage', status: 'Pending', ward: 'Ward 4' }
    ];
  },
};

export const updatesAPI = {
  getAll: async (ward?: string) => {
    await sleep(DELAY);
    return [
      { 
        id: 'upd-1', 
        title: 'Ward ' + (ward || '1') + ' Digital Literacy Drive 🎉', 
        date: 'Today • 10:30 AM',
        type: 'resolved_issue'
      },
      { 
        id: 'upd-2', 
        title: 'New Mobile Health Van Schedule Added', 
        date: 'Yesterday • 2:15 PM',
        type: 'general'
      },
      { 
        id: 'upd-3', 
        title: 'Community Hall Renovation Town Hall', 
        date: 'Mar 10, 2026',
        type: 'event'
      }
    ];
  },
};


export const chatAPI = {
  sendMessage: async (userId: string, message: string, sessionId: string) => {
    await sleep(DELAY);
    let mockResponse = 'I am currently in design-only mode. How can I help you with your community services today?';
    
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('doctor') || lowerMsg.includes('health')) {
      mockResponse = 'I can help you find health camps. There is a Specialized Dental Camp on March 25 in Ward 7. Would you like to register?';
    } else if (lowerMsg.includes('school') || lowerMsg.includes('scholarship')) {
      mockResponse = 'The Merit-Based Scholarship 2026 application is now open. The deadline is May 15th.';
    }

    return { response: mockResponse };
  },
};

export const seedAPI = {
  seedDatabase: async () => {
    await sleep(DELAY);
    return { status: 'success', message: 'Mock database seeded' };
  },
};

