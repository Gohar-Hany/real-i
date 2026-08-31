// ══════════════════════════════════════════════════════════════
// REAL_i — Mock Data for Educational Platform
// ══════════════════════════════════════════════════════════════

export const COURSES = [
  {
    id: 'ai-fundamentals',
    title: 'AI Fundamentals',
    subtitle: 'Master the foundations of Artificial Intelligence',
    description: 'A comprehensive introduction to Artificial Intelligence covering machine learning, neural networks, natural language processing, and computer vision. Perfect for beginners who want to build a strong foundation.',
    instructor: 'Dr. Ahmed Hassan',
    category: 'Artificial Intelligence',
    level: 'Beginner',
    duration: '8 weeks',
    totalHours: 24,
    lessonsCount: 32,
    studentsEnrolled: 1247,
    rating: 4.8,
    reviewsCount: 342,
    price: 0,
    badge: 'Popular',
    tags: ['AI', 'Machine Learning', 'Neural Networks'],
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
    color: '#D4AF37',
    modules: [
      {
        id: 'mod-1',
        title: 'Introduction to AI',
        lessons: [
          { id: 'l-1', title: 'What is Artificial Intelligence?', duration: '12:30', type: 'video', isPreview: true },
          { id: 'l-2', title: 'History of AI', duration: '15:00', type: 'video', isPreview: true },
          { id: 'l-3', title: 'Types of AI Systems', duration: '18:45', type: 'video', isPreview: false },
          { id: 'l-4', title: 'Quiz: AI Basics', duration: '10 min', type: 'quiz', isPreview: false },
        ]
      },
      {
        id: 'mod-2',
        title: 'Machine Learning Basics',
        lessons: [
          { id: 'l-5', title: 'Supervised vs Unsupervised Learning', duration: '20:00', type: 'video', isPreview: false },
          { id: 'l-6', title: 'Linear Regression', duration: '25:00', type: 'video', isPreview: false },
          { id: 'l-7', title: 'Classification Algorithms', duration: '22:30', type: 'video', isPreview: false },
          { id: 'l-8', title: 'Hands-on: First ML Model', duration: '30:00', type: 'video', isPreview: false },
        ]
      },
      {
        id: 'mod-3',
        title: 'Neural Networks',
        lessons: [
          { id: 'l-9', title: 'Perceptrons & Activation Functions', duration: '18:00', type: 'video', isPreview: false },
          { id: 'l-10', title: 'Backpropagation', duration: '22:00', type: 'video', isPreview: false },
          { id: 'l-11', title: 'Building Your First Neural Network', duration: '35:00', type: 'video', isPreview: false },
          { id: 'l-12', title: 'Quiz: Neural Networks', duration: '15 min', type: 'quiz', isPreview: false },
        ]
      },
    ]
  },
  {
    id: 'deep-learning',
    title: 'Deep Learning Mastery',
    subtitle: 'Advanced neural network architectures',
    description: 'Dive deep into convolutional neural networks, recurrent neural networks, transformers, and GANs. Build real-world projects including image classification and text generation.',
    instructor: 'Dr. Sarah Al-Rashid',
    category: 'Deep Learning',
    level: 'Advanced',
    duration: '12 weeks',
    totalHours: 48,
    lessonsCount: 56,
    studentsEnrolled: 834,
    rating: 4.9,
    reviewsCount: 198,
    price: 0,
    badge: 'Top Rated',
    tags: ['Deep Learning', 'CNN', 'RNN', 'Transformers'],
    thumbnail: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=800&q=80',
    color: '#B8860B',
    modules: [
      {
        id: 'mod-dl-1',
        title: 'CNNs for Computer Vision',
        lessons: [
          { id: 'dl-1', title: 'Convolutional Layers Explained', duration: '25:00', type: 'video', isPreview: true },
          { id: 'dl-2', title: 'Pooling & Feature Maps', duration: '20:00', type: 'video', isPreview: false },
          { id: 'dl-3', title: 'Transfer Learning with ResNet', duration: '30:00', type: 'video', isPreview: false },
        ]
      },
      {
        id: 'mod-dl-2',
        title: 'Sequence Models',
        lessons: [
          { id: 'dl-4', title: 'RNN & LSTM Architecture', duration: '28:00', type: 'video', isPreview: false },
          { id: 'dl-5', title: 'Attention Mechanism', duration: '35:00', type: 'video', isPreview: false },
          { id: 'dl-6', title: 'The Transformer Architecture', duration: '40:00', type: 'video', isPreview: false },
        ]
      },
    ]
  },
  {
    id: 'nlp-course',
    title: 'Natural Language Processing',
    subtitle: 'Build intelligent text processing systems',
    description: 'Learn to build NLP applications from text preprocessing to transformer-based models. Cover sentiment analysis, named entity recognition, machine translation, and question answering systems.',
    instructor: 'Prof. Omar Khalil',
    category: 'NLP',
    level: 'Intermediate',
    duration: '10 weeks',
    totalHours: 36,
    lessonsCount: 42,
    studentsEnrolled: 623,
    rating: 4.7,
    reviewsCount: 156,
    price: 0,
    badge: 'New',
    tags: ['NLP', 'Transformers', 'BERT', 'GPT'],
    thumbnail: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&w=800&q=80',
    color: '#8B6914',
    modules: [
      {
        id: 'mod-nlp-1',
        title: 'Text Preprocessing',
        lessons: [
          { id: 'nlp-1', title: 'Tokenization & Stemming', duration: '18:00', type: 'video', isPreview: true },
          { id: 'nlp-2', title: 'Word Embeddings (Word2Vec)', duration: '22:00', type: 'video', isPreview: false },
          { id: 'nlp-3', title: 'TF-IDF & Bag of Words', duration: '20:00', type: 'video', isPreview: false },
        ]
      },
    ]
  },
  {
    id: 'data-science',
    title: 'Data Science Bootcamp',
    subtitle: 'From data to insights with Python',
    description: 'Complete data science pipeline: data collection, cleaning, analysis, visualization, and modeling. Master pandas, matplotlib, scikit-learn, and real-world datasets.',
    instructor: 'Dr. Layla Mansour',
    category: 'Data Science',
    level: 'Beginner',
    duration: '10 weeks',
    totalHours: 40,
    lessonsCount: 48,
    studentsEnrolled: 1893,
    rating: 4.6,
    reviewsCount: 421,
    price: 0,
    badge: 'Bestseller',
    tags: ['Python', 'Pandas', 'Visualization', 'Statistics'],
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    color: '#D4AF37',
    modules: [
      {
        id: 'mod-ds-1',
        title: 'Python for Data Science',
        lessons: [
          { id: 'ds-1', title: 'NumPy Essentials', duration: '20:00', type: 'video', isPreview: true },
          { id: 'ds-2', title: 'Pandas DataFrames', duration: '25:00', type: 'video', isPreview: true },
          { id: 'ds-3', title: 'Data Visualization with Matplotlib', duration: '30:00', type: 'video', isPreview: false },
        ]
      },
    ]
  },
  {
    id: 'computer-vision',
    title: 'Computer Vision Engineering',
    subtitle: 'See the world through AI eyes',
    description: 'Build production-ready computer vision systems. Object detection with YOLO, image segmentation, face recognition, and deploying vision models at scale.',
    instructor: 'Dr. Ahmed Hassan',
    category: 'Computer Vision',
    level: 'Advanced',
    duration: '8 weeks',
    totalHours: 32,
    lessonsCount: 38,
    studentsEnrolled: 456,
    rating: 4.8,
    reviewsCount: 89,
    price: 0,
    badge: 'Advanced',
    tags: ['OpenCV', 'YOLO', 'Segmentation', 'Detection'],
    thumbnail: 'https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?auto=format&fit=crop&w=800&q=80',
    color: '#B8860B',
    modules: [
      {
        id: 'mod-cv-1',
        title: 'Image Processing Fundamentals',
        lessons: [
          { id: 'cv-1', title: 'Digital Image Representation', duration: '15:00', type: 'video', isPreview: true },
          { id: 'cv-2', title: 'Filters & Edge Detection', duration: '22:00', type: 'video', isPreview: false },
        ]
      },
    ]
  },
  {
    id: 'rag-systems',
    title: 'RAG Systems & Vector Databases',
    subtitle: 'Build intelligent retrieval systems',
    description: 'Master Retrieval-Augmented Generation (RAG) architecture. Learn vector databases, embedding models, chunking strategies, and build production RAG pipelines.',
    instructor: 'Prof. Omar Khalil',
    category: 'AI Engineering',
    level: 'Intermediate',
    duration: '6 weeks',
    totalHours: 20,
    lessonsCount: 24,
    studentsEnrolled: 312,
    rating: 4.9,
    reviewsCount: 67,
    price: 0,
    badge: 'Hot',
    tags: ['RAG', 'Vector DB', 'LangChain', 'Embeddings'],
    thumbnail: 'https://images.unsplash.com/photo-1633412802994-5c058f151b66?auto=format&fit=crop&w=800&q=80',
    color: '#D4AF37',
    modules: [
      {
        id: 'mod-rag-1',
        title: 'RAG Architecture',
        lessons: [
          { id: 'rag-1', title: 'What is RAG?', duration: '18:00', type: 'video', isPreview: true },
          { id: 'rag-2', title: 'Embedding Models Deep Dive', duration: '25:00', type: 'video', isPreview: false },
        ]
      },
    ]
  },
];

export const CATEGORIES = [
  'All',
  'Artificial Intelligence',
  'Deep Learning',
  'NLP',
  'Data Science',
  'Computer Vision',
  'AI Engineering',
];

export const PLATFORM_STATS = {
  totalStudents: 5365,
  totalCourses: 24,
  totalLessons: 380,
  totalQuizzes: 156,
  completionRate: 87,
  satisfactionRate: 96,
};

export const FEATURES = [
  {
    icon: 'Brain',
    title: 'AI-Powered Learning',
    description: 'Intelligent tutoring system that adapts to your learning pace and style with RAG-powered answers.',
  },
  {
    icon: 'BookOpen',
    title: 'Rich Course Content',
    description: 'Comprehensive courses with video lectures, interactive quizzes, and hands-on projects.',
  },
  {
    icon: 'MessageSquare',
    title: 'Smart AI Assistants',
    description: 'Three specialized AI agents — Friend, Student, and Admin — each designed for a unique role.',
  },
  {
    icon: 'Trophy',
    title: 'Track Your Progress',
    description: 'Real-time analytics, leaderboards, and certificates to motivate your learning journey.',
  },
];

export const TESTIMONIALS = [
  {
    name: 'Youssef Ahmed',
    role: 'AI Engineering Student',
    content: 'REAL_i transformed how I study. The AI assistant understands my course material better than any search engine. My grades improved significantly!',
    rating: 5,
  },
  {
    name: 'Nour El-Din',
    role: 'Data Science Student',
    content: 'The quiz system is incredible — it generates questions directly from our lecture PDFs. It\'s like having a personal tutor available 24/7.',
    rating: 5,
  },
  {
    name: 'Sara Mahmoud',
    role: 'NLP Researcher',
    content: 'As an instructor, the admin panel gives me full control. I can create guidelines and the AI follows them perfectly when helping students.',
    rating: 5,
  },
];

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Create Your Account',
    description: 'Sign up in seconds and get instant access to the platform.',
  },
  {
    step: 2,
    title: 'Explore Courses',
    description: 'Browse our curated AI & tech courses built by industry experts.',
  },
  {
    step: 3,
    title: 'Learn with AI',
    description: 'Study with your personal AI assistant that knows your course material.',
  },
  {
    step: 4,
    title: 'Track & Achieve',
    description: 'Take quizzes, track progress, and earn certificates of completion.',
  },
];
