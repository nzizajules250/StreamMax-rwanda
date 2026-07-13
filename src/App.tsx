import { useState, useEffect } from 'react';
import { 
  Home, Film, Search, User as UserIcon, ShieldCheck, Heart, Sparkles, 
  ArrowRight, PlayCircle, Star, Calendar, Clock, Compass 
} from 'lucide-react';

import { Movie, User, ActiveTab, ToastMessage } from './types';
import { INITIAL_MOVIES, GENRES } from './data/mockMovies';

// Firebase Integrations
import { 
  collection, doc, setDoc, getDocs, updateDoc, deleteDoc, 
  onSnapshot, getDocFromServer 
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from './lib/firebase';

// Subcomponents
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import MovieCard from './components/MovieCard';
import MovieDetailModal from './components/MovieDetailModal';
import SubscriptionModal from './components/SubscriptionModal';
import AuthPage from './components/AuthPage';
import UserProfile from './components/UserProfile';
import AdminDashboard from './components/AdminDashboard';
import VideoPlayerPage from './components/VideoPlayerPage';
import ToastContainer from './components/Toast';

export default function App() {
  // --- Core Application States ---
  const [movies, setMovies] = useState<Movie[]>(INITIAL_MOVIES);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [currentPlayingMovie, setCurrentPlayingMovie] = useState<Movie | null>(null);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // --- Filtering States for Movies Tab ---
  const [genreFilter, setGenreFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'movie' | 'series' | 'upcoming'>('all');

  // --- Connection test helper ---
  const testConnection = async () => {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
      console.log("Firebase connection established successfully.");
    } catch (error) {
      if (error instanceof Error && error.message.includes('offline')) {
        console.warn("Please check your Firebase configuration: Client is offline.");
      }
    }
  };

  // --- 1. Load & Seed Movies from Firestore ---
  useEffect(() => {
    testConnection();

    // Listen to real-time movies collection updates
    const unsubscribeMovies = onSnapshot(collection(db, 'movies'), async (snapshot) => {
      if (snapshot.empty) {
        console.log('No movies found in Firestore. Seeding default movie catalog...');
        try {
          for (const movie of INITIAL_MOVIES) {
            await setDoc(doc(db, 'movies', movie.id), movie);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, 'movies');
        }
      } else {
        const loadedMovies: Movie[] = [];
        snapshot.forEach((docSnap) => {
          loadedMovies.push(docSnap.data() as Movie);
        });
        // Sort newest first
        loadedMovies.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setMovies(loadedMovies);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'movies');
    });

    return () => {
      unsubscribeMovies();
    };
  }, []);

  // --- 2. Track Authentication Session & Profile ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        // Subscribe to real-time user profile document in Firestore
        const unsubscribeProfile = onSnapshot(doc(db, 'users', authUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            setCurrentUser(docSnap.data() as User);
          } else {
            console.warn("Auth user logged in, but Firestore profile is missing.");
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${authUser.uid}`);
        });

        return () => unsubscribeProfile();
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // --- 3. Track Registered Users list for Admin Dashboard ---
  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      setUsers([]);
      return;
    }

    const unsubscribeUsersList = onSnapshot(collection(db, 'users'), (snapshot) => {
      const allUsers: User[] = [];
      snapshot.forEach((docSnap) => {
        allUsers.push(docSnap.data() as User);
      });
      setUsers(allUsers);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'users');
    });

    return () => {
      unsubscribeUsersList();
    };
  }, [currentUser?.role]);

  // --- Synchronizing user state helper ---
  const syncUserState = async (updatedUser: User) => {
    try {
      await setDoc(doc(db, 'users', updatedUser.id), updatedUser);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, `users/${updatedUser.id}`);
    }
  };

  // --- Toast Manager ---
  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- Authentication Handlers ---
  const handleLoginSuccess = (user: User) => {
    addToast(`Signed in successfully as ${user.username}!`, 'success');
    setActiveTab('home');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      addToast('Logged out of Cinema session.', 'info');
      setActiveTab('home');
    } catch (err: any) {
      console.error("Signout error:", err);
      addToast(err.message || 'Failed to logout.', 'error');
    }
  };

  // --- Subscription Action ---
  const handleSubscribe = (planId: string, planName: string) => {
    if (!currentUser) return;
    const updatedUser: User = {
      ...currentUser,
      subscription: {
        active: true,
        planId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    };
    syncUserState(updatedUser);
    addToast(`Successfully subscribed to "${planName}"! Access granted.`, 'success');
  };

  // --- Likes Interaction ---
  const handleLikeToggle = async (movieId: string) => {
    if (!currentUser) {
      addToast('Please sign in to like this movie.', 'warning');
      setActiveTab('auth');
      return;
    }

    const isAlreadyLikedInSession = currentUser.watchlist.includes(movieId);
    
    // Find movie to adjust likes count
    const movieObj = movies.find(m => m.id === movieId);
    if (!movieObj) return;

    const updatedWatchlist = isAlreadyLikedInSession
      ? currentUser.watchlist.filter(id => id !== movieId)
      : [...currentUser.watchlist, movieId];

    const updatedUser: User = {
      ...currentUser,
      watchlist: updatedWatchlist
    };

    try {
      // Update User Watchlist in Firestore
      await syncUserState(updatedUser);
      // Update Movie Likes count in Firestore
      await updateDoc(doc(db, 'movies', movieId), {
        likes: isAlreadyLikedInSession ? Math.max(0, movieObj.likes - 1) : movieObj.likes + 1
      });

      addToast(
        isAlreadyLikedInSession ? 'Removed movie from your saved favorites.' : 'Saved to your favorites list!', 
        isAlreadyLikedInSession ? 'info' : 'success'
      );
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `movies/${movieId}`);
    }
  };

  // --- Watchlist Interaction ---
  const handleWatchlistToggle = async (movieId: string) => {
    if (!currentUser) {
      addToast('Please sign in to modify your watchlist.', 'warning');
      setActiveTab('auth');
      return;
    }

    const isWatchlisted = currentUser.watchlist.includes(movieId);
    const updatedWatchlist = isWatchlisted
      ? currentUser.watchlist.filter(id => id !== movieId)
      : [...currentUser.watchlist, movieId];

    const updatedUser: User = {
      ...currentUser,
      watchlist: updatedWatchlist
    };
    
    try {
      await syncUserState(updatedUser);
      addToast(
        isWatchlisted ? 'Removed movie from personal Watchlist' : 'Successfully added to Watchlist!',
        isWatchlisted ? 'info' : 'success'
      );
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.id}`);
    }
  };

  // --- Video Playback Trigger with Subscription Lock ---
  const handlePlayMovie = async (movie: Movie) => {
    if (!currentUser) {
      addToast('Authentication required. Please sign in to watch full movies.', 'warning');
      setActiveTab('auth');
      return;
    }

    if (!currentUser.subscription?.active) {
      addToast('Subscription required. Select an abonnement to stream movies for free.', 'info');
      setIsSubscriptionOpen(true);
      return;
    }

    // Log viewer history
    const alreadyWatchedIndex = currentUser.history.findIndex(item => item.movieId === movie.id);
    let updatedHistory = [...currentUser.history];
    let existingProgress = 0;
    let existingCurrentTime = 0;

    if (alreadyWatchedIndex > -1) {
      const existingItem = currentUser.history[alreadyWatchedIndex];
      existingProgress = existingItem.progress ?? 0;
      existingCurrentTime = existingItem.currentTime ?? 0;
      // Remove from old position so we can move it to the top (most recently watched)
      updatedHistory.splice(alreadyWatchedIndex, 1);
    }

    updatedHistory.unshift({
      movieId: movie.id,
      watchedAt: new Date().toISOString(),
      progress: existingProgress,
      currentTime: existingCurrentTime
    });

    const updatedUser: User = {
      ...currentUser,
      history: updatedHistory
    };

    try {
      await syncUserState(updatedUser);
      await updateDoc(doc(db, 'movies', movie.id), {
        views: movie.views + 1
      });
      addToast(`Now playing: "${movie.title}"`, 'success');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `movies/${movie.id}`);
    } finally {
      setSelectedMovie(null);
      setCurrentPlayingMovie(movie);
      setActiveTab('player');
    }
  };

  // --- Update Playback Progress dynamically from VideoPlayerPage ---
  const handleUpdatePlaybackProgress = async (movieId: string, progress: number, currentTime: number) => {
    if (!currentUser) return;

    const alreadyWatchedIndex = currentUser.history.findIndex(item => item.movieId === movieId);
    let updatedHistory = [...currentUser.history];

    if (alreadyWatchedIndex > -1) {
      updatedHistory[alreadyWatchedIndex] = {
        ...updatedHistory[alreadyWatchedIndex],
        watchedAt: new Date().toISOString(),
        progress,
        currentTime
      };
    } else {
      updatedHistory.unshift({
        movieId,
        watchedAt: new Date().toISOString(),
        progress,
        currentTime
      });
    }

    const updatedUser: User = {
      ...currentUser,
      history: updatedHistory
    };

    try {
      await syncUserState(updatedUser);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.id}`);
    }
  };

  // --- Admin Dashboard Handlers ---
  const handleAddMovie = async (newMovie: Omit<Movie, 'id' | 'views' | 'likes' | 'createdAt'>) => {
    const generatedId = `m-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const movieWithId: Movie = {
      ...newMovie,
      id: generatedId,
      views: 120, // default initial views
      likes: 8,
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'movies', generatedId), movieWithId);
      addToast(`Successfully added "${movieWithId.title}" to movie catalog!`, 'success');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, `movies/${generatedId}`);
    }
  };

  const handleDeleteMovie = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'movies', id));
      addToast("Successfully deleted movie from catalog.", "success");
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `movies/${id}`);
    }
  };

  const handleUpdateUserSubscription = async (userId: string, active: boolean, planId?: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        subscription: {
          active,
          planId: planId || null,
          expiresAt: active ? new Date(Date.now() + 30*24*60*60*1000).toISOString() : null
        }
      });
      addToast("Successfully updated user subscription.", "success");
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    }
  };

  // --- Active Featured & Next Movie for Hero ---
  const featuredMovies = movies.filter(m => m.isFeatured) || [];
  const activeFeatured = featuredMovies.length > 0 ? featuredMovies[0] : movies[0];
  const activeNext = movies.find(m => m.id !== activeFeatured?.id) || null;

  const handleSwapFeatured = async (movieToSwap: Movie) => {
    try {
      const promises = movies.map(m => {
        return updateDoc(doc(db, 'movies', m.id), {
          isFeatured: m.id === movieToSwap.id
        });
      });
      await Promise.all(promises);
      addToast(`Swapped cinematic showcase: ${movieToSwap.title}`, 'info');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, 'movies');
    }
  };

  // --- Movie Filter Calculations ---
  const filteredCatalog = movies.filter(movie => {
    const matchSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        movie.genre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchGenre = genreFilter === 'All' || movie.genre === genreFilter;
    const matchYear = yearFilter === 'All' || movie.releaseYear.toString() === yearFilter;
    
    // Support navbar's Tv Shows, Movies, and Upcoming filters
    let matchType = true;
    if (mediaTypeFilter === 'movie') {
      matchType = movie.type !== 'series';
    } else if (mediaTypeFilter === 'series') {
      matchType = movie.type === 'series';
    } else if (mediaTypeFilter === 'upcoming') {
      matchType = movie.releaseYear >= 2025;
    }
    
    return matchSearch && matchGenre && matchYear && matchType;
  });

  return (
    <div id="application-root" className="min-h-screen bg-brand-bg text-slate-100 flex flex-col justify-between font-sans pb-20 md:pb-0">
      {/* Toast Overlay */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Subscription Checkout Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
        currentUser={currentUser}
        onSubscribe={handleSubscribe}
        onOpenAuth={() => setActiveTab('auth')}
      />

      {/* Movie Detailed Overlay Modal */}
      <MovieDetailModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
        currentUser={currentUser}
        onPlay={handlePlayMovie}
        onLikeToggle={handleLikeToggle}
        onWatchlistToggle={handleWatchlistToggle}
        isLiked={currentUser ? currentUser.watchlist.includes(selectedMovie?.id || '') : false}
        isWatchlisted={currentUser ? currentUser.watchlist.includes(selectedMovie?.id || '') : false}
        isSubscribed={currentUser ? currentUser.subscription?.active : false}
      />

      {/* Navigation Brand Header & Floating Middle Curved Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
        mediaTypeFilter={mediaTypeFilter}
        setMediaTypeFilter={setMediaTypeFilter}
        setGenreFilter={setGenreFilter}
      />

      {/* Primary Layout Router */}
      <main className={`flex-1 w-full mx-auto ${activeTab === 'home' ? 'py-0' : 'max-w-7xl py-4 px-4'}`}>
        {activeTab === 'home' && (
          <div id="home-view" className="space-y-12 animate-fadeIn pb-16">
            {/* Cinematic Hero - Edge to Edge 100vh */}
            {activeFeatured && (
              <HeroSection
                featuredMovie={activeFeatured}
                nextMovie={activeNext}
                onPlay={handlePlayMovie}
                onDetail={setSelectedMovie}
                onLikeToggle={handleLikeToggle}
                isLiked={currentUser ? currentUser.watchlist.includes(activeFeatured.id) : false}
                onSwapFeatured={handleSwapFeatured}
                moviesList={movies}
              />
            )}

            {/* Rest of home content wrapped in standard container for desktop precision */}
            <div className="max-w-7xl mx-auto space-y-16">
              {/* Continue Watching Section */}
              {currentUser && currentUser.history && currentUser.history.length > 0 && (
              <section className="px-6 md:px-12 space-y-4 animate-fadeIn" id="continue-watching-section">
                <div>
                  <h3 className="text-2xl font-black tracking-wider text-white flex items-center gap-2 font-display uppercase">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <span>Continue Watching</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Pick up right where you left off in your cinematic journey.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {currentUser.history
                    .map(hist => {
                      const movie = movies.find(m => m.id === hist.movieId);
                      return movie ? { ...movie, progress: hist.progress, currentTime: hist.currentTime || 0 } : null;
                    })
                    .filter((m): m is (Movie & { progress: number; currentTime: number }) => m !== null)
                    .slice(0, 4) // Show up to 4 most recently watched movies
                    .map((movie) => (
                      <div
                        key={movie.id}
                        id={`continue-watching-card-${movie.id}`}
                        onClick={() => handlePlayMovie(movie)}
                        className="group bg-slate-900/40 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] flex flex-col shadow-lg relative"
                      >
                        {/* Thumbnail Container */}
                        <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                          <img
                            src={movie.thumbnailUrl}
                            alt={movie.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {/* Duration Badge */}
                          <span className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur-sm border border-slate-800/60 text-[9px] font-bold text-slate-300 px-1.5 py-0.5 rounded">
                            {movie.duration}
                          </span>
                          {/* Play Hover Overlay */}
                          <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-10 h-10 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center font-black scale-90 group-hover:scale-100 transition-all shadow-lg shadow-amber-500/20">
                              <PlayCircle className="w-6 h-6 fill-current ml-0.5" />
                            </div>
                          </div>
                        </div>

                        {/* Card Details */}
                        <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">
                              {movie.genre}
                            </span>
                            <h4 className="text-sm font-bold text-white leading-tight group-hover:text-amber-400 transition-colors line-clamp-1">
                              {movie.title}
                            </h4>
                          </div>

                          {/* Progress bar container */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                              <span>{movie.progress}% completed</span>
                              {movie.currentTime > 0 && (
                                <span>{Math.floor(movie.currentTime / 60)}m left</span>
                              )}
                            </div>
                            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                              <div
                                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                                style={{ width: `${movie.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            )}

            {/* Trending Slider Section */}
            <section className="px-6 md:px-12 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black tracking-wider text-white flex items-center gap-2 font-display uppercase">
                    <Compass className="w-5 h-5 text-amber-500" />
                    <span>Trending Masterpieces</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Voted blockbusters with highest digital viewer stream counts.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="home-trending-grid">
                {movies.slice(0, 3).map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onPlay={handlePlayMovie}
                    onDetail={setSelectedMovie}
                    onLikeToggle={handleLikeToggle}
                    isLiked={currentUser ? currentUser.watchlist.includes(movie.id) : false}
                    isSubscribed={currentUser ? currentUser.subscription?.active : false}
                  />
                ))}
              </div>
            </section>

            {/* Featured Collection Grid */}
            <section className="px-6 md:px-12 pb-12 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black tracking-wider text-white flex items-center gap-2 font-display uppercase">
                    <Film className="w-5 h-5 text-amber-500" />
                    <span>Browse All Content</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Explore our total cinematic catalog. Filter and play movies instantly.</p>
                </div>
                <button
                  id="browse-more-trigger"
                  onClick={() => setActiveTab('movies')}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="home-catalog-grid">
                {movies.slice(2, 5).map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onPlay={handlePlayMovie}
                    onDetail={setSelectedMovie}
                    onLikeToggle={handleLikeToggle}
                    isLiked={currentUser ? currentUser.watchlist.includes(movie.id) : false}
                    isSubscribed={currentUser ? currentUser.subscription?.active : false}
                  />
                ))}
              </div>
            </section>
          </div>
          </div>
        )}

        {activeTab === 'movies' && (
          <div id="movies-catalog-view" className="px-6 md:px-12 space-y-8 animate-fadeIn">
            <div>
              <h2 className="text-3xl font-black font-sans tracking-tight">Cinematic Catalog</h2>
              <p className="text-slate-400 text-xs mt-1">Refine options by genre, release year, or keywords to start playing.</p>
            </div>

            {/* Interactive Filters Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                {/* Genre Tabs */}
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((g) => (
                    <button
                      id={`genre-tab-${g}`}
                      key={g}
                      onClick={() => setGenreFilter(g)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        genreFilter === g
                          ? 'bg-amber-500 border-amber-500 text-slate-950 font-black'
                          : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>

                {/* Release Year Filter */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <span className="text-xs text-slate-400 font-bold shrink-0">Year:</span>
                  <select
                    id="catalog-year-select"
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="w-full md:w-40 bg-slate-950 border border-slate-850 rounded-xl text-xs px-3.5 py-2 text-slate-200 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
                  >
                    <option value="All">All Release Years</option>
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Movies Display */}
            {filteredCatalog.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-850/80">
                <p className="text-slate-400 text-sm">No movies match your current filter preferences. Try adjusting query fields.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="catalog-movies-grid">
                {filteredCatalog.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onPlay={handlePlayMovie}
                    onDetail={setSelectedMovie}
                    onLikeToggle={handleLikeToggle}
                    isLiked={currentUser ? currentUser.watchlist.includes(movie.id) : false}
                    isSubscribed={currentUser ? currentUser.subscription?.active : false}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'search' && (
          <div id="search-view" className="px-6 md:px-12 space-y-8 animate-fadeIn">
            <div>
              <h2 className="text-3xl font-black font-sans tracking-tight">Smart Search</h2>
              <p className="text-slate-400 text-xs mt-1">Find exact titles by genre, keywords, actors, or release year.</p>
            </div>

            {/* Large Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  id="global-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, genre, directors, casting..."
                  className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-2xl pl-12 pr-4 py-4 text-sm text-slate-100 focus:outline-none transition-all placeholder:text-slate-500 shadow-xl"
                />
                <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Results Grid */}
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4">
                {searchQuery ? `Search results for "${searchQuery}"` : 'All Available Titles'} ({filteredCatalog.length})
              </h4>

              {filteredCatalog.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-850/80">
                  <p className="text-slate-400 text-sm">No results match your search keywords. Try different phrases!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="search-results-grid">
                  {filteredCatalog.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onPlay={handlePlayMovie}
                      onDetail={setSelectedMovie}
                      onLikeToggle={handleLikeToggle}
                      isLiked={currentUser ? currentUser.watchlist.includes(movie.id) : false}
                      isSubscribed={currentUser ? currentUser.subscription?.active : false}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <UserProfile
            currentUser={currentUser}
            movies={movies}
            onRemoveFromWatchlist={handleWatchlistToggle}
            onPlayMovie={handlePlayMovie}
            onOpenSubscription={() => setIsSubscriptionOpen(true)}
          />
        )}

        {activeTab === 'admin' && currentUser?.role === 'admin' && (
          <div className="px-6 md:px-12">
            <AdminDashboard
              movies={movies}
              users={users}
              onAddMovie={handleAddMovie}
              onDeleteMovie={handleDeleteMovie}
              onUpdateUserSubscription={handleUpdateUserSubscription}
              addToast={addToast}
            />
          </div>
        )}

        {activeTab === 'auth' && (
          <AuthPage onLoginSuccess={handleLoginSuccess} addToast={addToast} />
        )}

        {activeTab === 'player' && currentPlayingMovie && (
          <VideoPlayerPage
            movie={currentPlayingMovie}
            allMovies={movies}
            currentUser={currentUser}
            onLikeToggle={handleLikeToggle}
            onWatchlistToggle={handleWatchlistToggle}
            onPlayMovie={handlePlayMovie}
            onBack={() => setActiveTab('home')}
            addToast={addToast}
            onUpdateHistory={handleUpdatePlaybackProgress}
          />
        )}
      </main>

      {/* MOBILE BOTTOM TAB BAR (Responsive Constraint) */}
      <nav 
        id="mobile-bottom-tab-bar"
        className="fixed bottom-4 left-4 right-4 mx-auto max-w-sm z-50 bg-[#070101]/95 border border-[#1b0303] backdrop-blur-lg flex items-center justify-around py-2.5 md:hidden px-4 rounded-2xl shadow-2xl shadow-black/80"
      >
        <button
          id="mobile-tab-home"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeTab === 'home' ? 'text-[#00E600]' : 'text-slate-400'
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="text-[8px] font-bold uppercase tracking-wider">Home</span>
        </button>

        <button
          id="mobile-tab-movies"
          onClick={() => setActiveTab('movies')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeTab === 'movies' ? 'text-[#00E600]' : 'text-slate-400'
          }`}
        >
          <Film className="w-4 h-4" />
          <span className="text-[8px] font-bold uppercase tracking-wider">Catalog</span>
        </button>

        <button
          id="mobile-tab-search"
          onClick={() => setActiveTab('search')}
          className={`flex flex-col items-center justify-center cursor-pointer transition-all ${
            activeTab === 'search' 
              ? 'relative -top-5 w-11 h-11 rounded-full bg-gradient-to-tr from-[#00E600] to-[#00E6A2] text-slate-950 shadow-lg shadow-teal-950/40 border-2 border-[#070101] scale-110' 
              : 'relative -top-3 w-9 h-9 rounded-full bg-slate-900 text-slate-300 border border-slate-800 shadow-md shadow-black/40 hover:scale-105'
          }`}
        >
          <Search className="w-3.5 h-3.5 font-bold" />
        </button>

        <button
          id="mobile-tab-profile"
          onClick={() => setActiveTab(currentUser ? 'profile' : 'auth')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeTab === 'profile' || activeTab === 'auth' ? 'text-[#00E600]' : 'text-slate-400'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span className="text-[8px] font-bold uppercase tracking-wider">Cinema</span>
        </button>
      </nav>

      {/* Modern Global Cinematic Footer */}
      <footer className="w-full border-t border-[#1b0303] bg-[#070101] mt-16 py-8 px-6 text-center text-xs text-slate-500">
        <p className="font-medium tracking-wide">© 2026 CineLand Networks. Powered by Cloudinary & VIP Premium Abonnements.</p>
        <p className="text-[10px] text-slate-600 mt-1">Frictionless high-contrast mockup database. All rights reserved.</p>
      </footer>
    </div>
  );
}
