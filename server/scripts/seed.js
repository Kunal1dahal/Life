import { create, writeJsonFile, getCollectionPath } from '../config/fileStorage.js';

// Sample data
const categories = [
  {
    name: 'Work Projects',
    emoji: '💼',
    color: 'blue'
  },
  {
    name: 'Personal Development',
    emoji: '🌱',
    color: 'green'
  },
  {
    name: 'Health & Fitness',
    emoji: '🏃‍♂️',
    color: 'red'
  },
  {
    name: 'Creative Ideas',
    emoji: '🎨',
    color: 'purple'
  }
];

const journalEntries = [
  {
    title: 'First Day with New System',
    content: '<p>Today I started using this new productivity system. It feels organized and I can already see how it will help me track my progress better.</p>',
    mood: '😊',
    tags: ['productivity', 'new-start']
  },
  {
    title: 'Reflection on Goals',
    content: '<p>Spent some time thinking about my long-term goals today. I realize I need to be more specific about what I want to achieve.</p>',
    mood: '🤔',
    tags: ['goals', 'reflection']
  }
];

const habits = [
  {
    name: 'Morning Exercise',
    question: 'Did you exercise for at least 30 minutes today?',
    color: 'red',
    entries: [
      { date: '2024-01-15', completed: true },
      { date: '2024-01-16', completed: false },
      { date: '2024-01-17', completed: true }
    ]
  },
  {
    name: 'Daily Reading',
    question: 'Did you read for at least 20 minutes today?',
    color: 'blue',
    entries: [
      { date: '2024-01-15', completed: true },
      { date: '2024-01-16', completed: true },
      { date: '2024-01-17', completed: false }
    ]
  }
];

const journeyNodes = [
  {
    title: 'Learn File-Based Storage',
    question: 'Complete the file-based storage implementation and test all CRUD operations',
    status: 'pending',
    currentDate: new Date().toISOString(),
    x: 0,
    y: 0
  },
  {
    title: 'Morning Routine',
    question: 'Establish a consistent morning routine that includes exercise and meditation',
    status: 'completed',
    currentDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    completedAt: new Date().toISOString(),
    x: 100,
    y: 100
  }
];

// Clear existing data and seed new data
const seedData = async () => {
  try {
    console.log('🌱 Seeding database with sample data...');
    
    // Clear existing files
    const collections = ['categories', 'ideas', 'journal', 'habits', 'clicks', 'journey', 'fonts'];
    collections.forEach(collection => {
      const filePath = getCollectionPath(collection);
      writeJsonFile(filePath, []);
    });
    
    // Seed categories
    const createdCategories = [];
    for (const categoryData of categories) {
      const category = create('categories', categoryData);
      createdCategories.push(category);
    }
    console.log('✅ Categories seeded...');

    // Seed ideas with category references
    const ideas = [
      {
        title: 'Build a Task Management App',
        description: '<p>Create a comprehensive task management application with features like project organization, deadlines, and team collaboration.</p>',
        category: createdCategories[0]._id,
        status: 'in-progress',
        priority: 'high',
        attachments: []
      },
      {
        title: 'Learn React Native',
        description: '<p>Master React Native development to build cross-platform mobile applications.</p>',
        category: createdCategories[1]._id,
        status: 'todo',
        priority: 'medium',
        attachments: []
      },
      {
        title: 'Design a Workout Plan',
        description: '<p>Create a structured workout plan that includes strength training, cardio, and flexibility exercises.</p>',
        category: createdCategories[2]._id,
        status: 'completed',
        priority: 'high',
        attachments: []
      },
      {
        title: 'Digital Art Portfolio',
        description: '<p>Build an online portfolio showcasing digital art and design work.</p>',
        category: createdCategories[3]._id,
        status: 'on-hold',
        priority: 'low',
        attachments: []
      }
    ];

    for (const ideaData of ideas) {
      create('ideas', ideaData);
    }
    console.log('✅ Ideas seeded...');

    // Seed journal entries
    for (const entryData of journalEntries) {
      create('journal', entryData);
    }
    console.log('✅ Journal entries seeded...');

    // Seed habits
    for (const habitData of habits) {
      create('habits', habitData);
    }
    console.log('✅ Habits seeded...');

    // Seed journey nodes
    for (const nodeData of journeyNodes) {
      create('journey', nodeData);
    }
    console.log('✅ Journey nodes seeded...');

    console.log('🎉 Database seeded successfully!');
    console.log('📁 All data stored in JSON files in the database folder');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

// Run seeding
seedData();