import { Movie } from '../types';

export const INITIAL_MOVIES: Movie[] = [
  {
    id: 'mandala',
    title: 'Mandala Murders',
    description: 'In the shadow of ancient blood symbols, a relentless detective is thrown into a dark maze of serial murders connected to deep-seated conspiracies.',
    genre: 'Mystery',
    releaseYear: 2026,
    thumbnailUrl: '/src/assets/images/mandala_murders_hero_1783948562636.jpg',
    trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    duration: 'Season 1',
    rating: 'TV-MA',
    cast: ['Vaani Kapoor', 'Vaibhav Raj Gupta'],
    views: 184000,
    likes: 12400,
    isFeatured: true,
    type: 'series',
    episodes: [
      {
        id: 'ep-1',
        episodeNumber: 1,
        seasonNumber: 1,
        title: 'The Sacred Sign',
        duration: '42m',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
      },
      {
        id: 'ep-2',
        episodeNumber: 2,
        seasonNumber: 1,
        title: 'Blood Circle',
        duration: '45m',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
      },
      {
        id: 'ep-3',
        episodeNumber: 3,
        seasonNumber: 1,
        title: 'Runic Secrets',
        duration: '50m',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
      }
    ],
    createdAt: '2026-07-13T00:00:03Z'
  },
  {
    id: 'ghaati',
    title: 'Ghaati',
    description: 'A gritty, high-stakes thriller of redemption and power set in the dusty, lawless terrains of the red hills.',
    genre: 'Drama',
    releaseYear: 2025,
    thumbnailUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=800',
    trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    duration: '2h 15m',
    rating: 'R',
    cast: ['NTR Jr', 'Anupama Parameswaran'],
    views: 124500,
    likes: 8520,
    isFeatured: false,
    createdAt: '2026-07-13T00:00:01Z'
  },
  {
    id: 'pushpa',
    title: 'Pushpa',
    description: 'The rise of a low-wage smuggler in the red sandalwood syndicate, battling ruthless law enforcement and rival cartels to claim the throne.',
    genre: 'Action',
    releaseYear: 2024,
    thumbnailUrl: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?q=80&w=800',
    trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    duration: '2h 55m',
    rating: 'R',
    cast: ['Allu Arjun', 'Rashmika Mandanna', 'Fahadh Faasil'],
    views: 98400,
    likes: 7120,
    isFeatured: false,
    createdAt: '2026-07-13T00:00:02Z'
  },
  {
    id: 'yodha',
    title: 'Yodha',
    description: 'After a commercial aircraft is hijacked by armed terrorists, an off-duty soldier on board devises an elite strategy to neutralize the hijackers and save the passengers.',
    genre: 'Action',
    releaseYear: 2024,
    thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800',
    trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: '2h 10m',
    rating: 'PG-13',
    cast: ['Sidharth Malhotra', 'Raashii Khanna', 'Disha Patani'],
    views: 74200,
    likes: 5210,
    isFeatured: false,
    createdAt: '2026-07-13T00:00:04Z'
  },
  {
    id: 'maalik',
    title: 'Maalik',
    description: 'An elite military veteran turned private bodyguard takes on a assignment to protect a high-ranking official, only to find himself entangled in a massive corporate coup.',
    genre: 'Drama',
    releaseYear: 2025,
    thumbnailUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800',
    trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: '2h 20m',
    rating: 'R',
    cast: ['Sanjay Dutt', 'Arshad Warsi'],
    views: 65100,
    likes: 4390,
    isFeatured: false,
    createdAt: '2026-07-13T00:00:05Z'
  },
  {
    id: 'kingdom',
    title: 'Kingdom',
    description: 'In a medieval kingdom plagued by corruption and famine, a mysterious plague turns citizens into flesh-eating monsters, forcing the crown prince to defend his throne.',
    genre: 'Thriller',
    releaseYear: 2024,
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800',
    trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: '2h 05m',
    rating: 'TV-MA',
    cast: ['Ju Ji-hoon', 'Bae Doona'],
    views: 45000,
    likes: 3100,
    isFeatured: false,
    createdAt: '2026-07-13T00:00:06Z'
  }
];

export const GENRES = [
  'All',
  'Action',
  'Sci-Fi',
  'Adventure',
  'Fantasy',
  'Romance',
  'Animation',
  'Thriller',
  'Drama',
  'Mystery'
];

export const PLANS = [
  {
    id: 'starter',
    name: 'Starter Pass',
    price: 9.99,
    durationDays: 30,
    description: 'Ideal for casual viewers. Stream standard quality on any 1 device.',
    features: [
      'Unlimited access for 30 days',
      'Standard Definition (SD)',
      'Watch on phone or tablet',
      'Simulate offline downloads'
    ]
  },
  {
    id: 'gold',
    name: 'Gold Cinema',
    price: 14.99,
    durationDays: 30,
    description: 'Best seller. HD streaming and multiple screen access for families.',
    features: [
      'Unlimited access for 30 days',
      'High Definition (HD)',
      'Watch on 2 screens simultaneously',
      'Personalized movie suggestions',
      'Priority access to trailers'
    ]
  },
  {
    id: 'premium',
    name: 'Ultra Premium VIP',
    price: 24.99,
    durationDays: 30,
    description: 'The ultimate theater experience. 4K HDR streaming with immersive sound.',
    features: [
      'Unlimited access for 30 days',
      'Ultra HD (4K) & HDR quality',
      'Watch on 4 screens simultaneously',
      'Immersive Dolby Atmos Sound simulation',
      'Early access to new admin uploads',
      'Custom VIP badge on user profile'
    ]
  }
];
