import React, { useEffect, useRef, useState, FormEvent } from 'react';
import { 
  ArrowLeft, Heart, Bookmark, BookmarkCheck, Play, Volume2, Maximize2, 
  Eye, ThumbsUp, Calendar, Clock, Sparkles, Star, Share2, Film, CheckCircle2,
  Tv
} from 'lucide-react';
import { Movie, User, Episode } from '../types';

interface VideoPlayerPageProps {
  movie: Movie;
  allMovies: Movie[];
  currentUser: User | null;
  onLikeToggle: (id: string) => void;
  onWatchlistToggle: (id: string) => void;
  onPlayMovie: (movie: Movie) => void;
  onBack: () => void;
  addToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  onUpdateHistory: (movieId: string, progress: number, currentTime: number) => Promise<void>;
}

export default function VideoPlayerPage({
  movie,
  allMovies,
  currentUser,
  onLikeToggle,
  onWatchlistToggle,
  onPlayMovie,
  onBack,
  addToast,
  onUpdateHistory
}: VideoPlayerPageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const lastSavedTimeRef = useRef<number>(0);
  const stateRef = useRef({ currentTime: 0, duration: 0 });

  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);

  useEffect(() => {
    if (movie.type === 'series' && movie.episodes && movie.episodes.length > 0) {
      setCurrentEpisode(movie.episodes[0]);
    } else {
      setCurrentEpisode(null);
    }
  }, [movie]);

  // Sync references to latest props to avoid stale closures in the unmount cleanup
  const onUpdateHistoryRef = useRef(onUpdateHistory);
  useEffect(() => {
    onUpdateHistoryRef.current = onUpdateHistory;
  }, [onUpdateHistory]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const saveProgress = (currentTime: number, duration: number) => {
    if (!currentUser || !duration || duration <= 0) return;
    const progress = Math.min(100, Math.floor((currentTime / duration) * 100));
    lastSavedTimeRef.current = currentTime;
    onUpdateHistoryRef.current(movie.id, progress, currentTime);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const historyItem = currentUser?.history?.find(item => item.movieId === movie.id);
      if (historyItem && historyItem.currentTime && historyItem.currentTime > 0) {
        if (historyItem.progress < 98) {
          videoRef.current.currentTime = historyItem.currentTime;
          addToast(`Resuming playback from ${formatTime(historyItem.currentTime)}...`, 'success');
        }
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration || 0;
      stateRef.current = { currentTime, duration };

      // Periodically save if progress has moved by more than 8 seconds
      if (Math.abs(currentTime - lastSavedTimeRef.current) > 8) {
        saveProgress(currentTime, duration);
      }
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      saveProgress(videoRef.current.currentTime, videoRef.current.duration || 0);
    }
  };

  const handleBackWithSave = () => {
    if (videoRef.current) {
      saveProgress(videoRef.current.currentTime, videoRef.current.duration || 0);
    }
    onBack();
  };

  // On unmount (or when movie changes), save the progress
  useEffect(() => {
    lastSavedTimeRef.current = 0;
    stateRef.current = { currentTime: 0, duration: 0 };

    return () => {
      const { currentTime, duration } = stateRef.current;
      if (currentTime > 0 && duration > 0) {
        const progress = Math.min(100, Math.floor((currentTime / duration) * 100));
        onUpdateHistoryRef.current(movie.id, progress, currentTime);
      }
    };
  }, [movie.id]);

  // Filter out the current movie, and prioritize same-genre movies first, then others
  const relatedMovies = allMovies
    .filter(m => m.id !== movie.id)
    .sort((a, b) => {
      if (a.genre === movie.genre && b.genre !== movie.genre) return -1;
      if (a.genre !== movie.genre && b.genre === movie.genre) return 1;
      return b.views - a.views; // Sort popular first
    })
    .slice(0, 4);

  const isLiked = currentUser ? currentUser.watchlist.includes(movie.id) : false; // Toggling likes is currently linked to likes/watchlist in app
  const isWatchlisted = currentUser ? currentUser.watchlist.includes(movie.id) : false;

  // Track simple simulated ratings/reviews
  const [reviews, setReviews] = useState<{ id: string; user: string; text: string; rating: number; date: string }[]>([
    { id: '1', user: 'Alex Mercer', text: 'Stunning cinematography and gripping storyline. Definitely worth watching in Ultra HD!', rating: 5, date: '2 hours ago' },
    { id: '2', user: 'Elena Rostova', text: 'A masterpiece! The audio score is incredible. Kept me on the edge of my seat.', rating: 4, date: '1 day ago' },
  ]);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);

  const handleAddReview = (e: FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;

    if (!currentUser) {
      addToast('Please sign in to write an expert review.', 'warning');
      return;
    }

    const review = {
      id: Date.now().toString(),
      user: currentUser.username,
      text: newReviewText,
      rating: newReviewRating,
      date: 'Just now'
    };

    setReviews([review, ...reviews]);
    setNewReviewText('');
    addToast('Review posted successfully!', 'success');
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl).then(() => {
      addToast(`Movie streaming link copied to clipboard!`, 'success');
    }).catch(() => {
      addToast(`Failed to copy link. Streaming URL: ${shareUrl}`, 'info');
    });
  };

  // Scroll to top smoothly when the movie changes or episode switches
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch((err) => {
        console.log('Autoplay blocked or interrupted:', err);
      });
    }
  }, [movie.id, currentEpisode?.id]);

  return (
    <div ref={topRef} id="video-player-container" className="px-4 md:px-12 py-4 space-y-8 animate-fadeIn">
      {/* Upper Navigation Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <button 
          id="player-back-btn"
          onClick={handleBackWithSave} 
          className="group flex items-center gap-2.5 text-slate-400 hover:text-amber-400 font-bold text-sm transition-all cursor-pointer self-start"
        >
          <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl group-hover:border-amber-500/40 group-hover:bg-slate-850 transition-all">
            <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:text-amber-400" />
          </div>
          <span>Return to Theater</span>
        </button>

        {/* Current Active Breadcrumb Status */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span className="text-amber-400 font-bold tracking-wider font-display">THEATER MODE</span>
          <span>•</span>
          <span className="tracking-wider">STREAMING NOW</span>
          <span>•</span>
          <span className="text-slate-300 font-bold">{movie.title}{currentEpisode ? ` - ${currentEpisode.title}` : ''}</span>
        </div>
      </div>

      {/* Main Responsive Cinematic Screen */}
      <div className="relative aspect-video w-full bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl shadow-black/80 group">
        <video
          ref={videoRef}
          id="cinematic-video-element"
          src={currentEpisode ? currentEpisode.videoUrl : movie.videoUrl}
          poster={movie.thumbnailUrl}
          controls
          autoPlay
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPause={handlePause}
          className="w-full h-full object-contain"
          style={{ maxHeight: '70vh' }}
        >
          Your browser does not support the video tag.
        </video>
        
        {/* Subtle bottom edge lighting effect */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/20 via-orange-500/30 to-amber-500/20 blur-sm" />
      </div>

      {/* Main Info Columns Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details & Synopsis Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 bg-amber-500 text-slate-950 text-xs font-black rounded-lg uppercase tracking-wider">
                {movie.genre}
              </span>
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold rounded-lg flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-500" />
                {movie.releaseYear}
              </span>
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold rounded-lg flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-500" />
                {movie.duration}
              </span>
              <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black rounded-lg flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                {movie.rating}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-wide text-white font-display">
              {movie.title}
            </h1>
          </div>

          {/* Episodes Playlist Selector (Only if it is a TV series) */}
          {movie.type === 'series' && movie.episodes && movie.episodes.length > 0 && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800/85 pb-3">
                <h3 className="text-sm font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5 font-display">
                  <Tv className="w-4 h-4 text-amber-500" />
                  <span>Series Episodes ({movie.episodes.length})</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-500">SELECT TO STREAM</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                {movie.episodes.map((ep) => {
                  const isActive = currentEpisode?.id === ep.id;
                  return (
                    <button
                      key={ep.id}
                      type="button"
                      onClick={() => {
                        setCurrentEpisode(ep);
                        addToast(`Streaming Season 1 Episode ${ep.episodeNumber}: ${ep.title}`, 'info');
                      }}
                      className={`text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 cursor-pointer group ${
                        isActive
                          ? 'bg-amber-500/10 border-amber-500/50 shadow shadow-amber-500/10'
                          : 'bg-slate-950/60 border-slate-850 hover:border-slate-700/60 hover:bg-slate-950'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isActive
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 group-hover:bg-slate-850 group-hover:text-slate-200'
                      }`}>
                        {isActive ? <Play className="w-3.5 h-3.5 fill-current" /> : ep.episodeNumber}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block text-xs font-bold text-slate-200 truncate group-hover:text-white transition-colors">
                          {ep.title}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] uppercase font-bold text-slate-500">Episode {ep.episodeNumber}</span>
                          <span className="text-[9px] font-mono text-slate-600">•</span>
                          <span className="text-[9px] font-mono text-slate-500">{ep.duration}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Synopsis Description Panel */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Synopsis / Plot Outline</h3>
            <p className="text-slate-300 text-sm leading-relaxed font-sans">
              {movie.description}
            </p>
          </div>

          {/* Custom Action Bar */}
          <div className="flex flex-wrap gap-3 items-center justify-between border-t border-b border-slate-900 py-4">
            <div className="flex flex-wrap gap-2">
              <button
                id="player-like-btn"
                onClick={() => {
                  onLikeToggle(movie.id);
                  addToast(isLiked ? 'Removed movie like interaction' : 'Liked this masterpiece!', 'success');
                }}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-2 cursor-pointer ${
                  isLiked 
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                <span>{isLiked ? 'Liked' : 'Like'}</span>
              </button>

              <button
                id="player-watchlist-btn"
                onClick={() => onWatchlistToggle(movie.id)}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-2 cursor-pointer ${
                  isWatchlisted 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {isWatchlisted ? (
                  <>
                    <BookmarkCheck className="w-3.5 h-3.5" />
                    <span>Watchlisted</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Watchlist</span>
                  </>
                )}
              </button>

              <button
                id="player-share-btn"
                onClick={handleShare}
                className="px-4 py-2 text-xs font-bold bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-slate-500" />
                <strong>{movie.views.toLocaleString()}</strong> views
              </span>
              <span className="flex items-center gap-1.5">
                <ThumbsUp className="w-3.5 h-3.5 text-slate-500" />
                <strong>{movie.likes.toLocaleString()}</strong> likes
              </span>
            </div>
          </div>

          {/* Casting Stars Panel */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase text-slate-400 tracking-wider font-display">Cast & Starring Crew</h4>
            <div className="flex flex-wrap gap-2">
              {movie.cast.map((actor, idx) => (
                <div 
                  key={idx}
                  className="px-3.5 py-2 bg-slate-900/60 border border-slate-850 rounded-xl flex items-center gap-2 text-xs text-slate-300 font-medium"
                >
                  <div className="w-5 h-5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full flex items-center justify-center font-bold text-[10px]">
                    {actor.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span>{actor}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar - High Contrast Metadata & Custom Review Feed */}
        <div className="space-y-6">
          {/* Tech Spec Badges */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-850 p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm tracking-wide font-display">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Cinematic Tech Specs</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="bg-slate-950 border border-slate-900 p-2.5 rounded-lg text-slate-400">
                <span className="block text-[9px] text-slate-600 font-bold">STREAM QUALITY</span>
                <span className="text-amber-400 font-black">Ultra HD 4K</span>
              </div>
              <div className="bg-slate-950 border border-slate-900 p-2.5 rounded-lg text-slate-400">
                <span className="block text-[9px] text-slate-600 font-bold">AUDIO PROFILE</span>
                <span className="text-slate-200 font-bold">Dolby Atmos 7.1</span>
              </div>
              <div className="bg-slate-950 border border-slate-900 p-2.5 rounded-lg text-slate-400">
                <span className="block text-[9px] text-slate-600 font-bold">BANDWIDTH</span>
                <span className="text-emerald-400 font-bold">VIP Premium</span>
              </div>
              <div className="bg-slate-950 border border-slate-900 p-2.5 rounded-lg text-slate-400">
                <span className="block text-[9px] text-slate-600 font-bold">LICENSE TYPE</span>
                <span className="text-blue-400 font-bold">Private Stream</span>
              </div>
            </div>
          </div>

          {/* Expert Reviews Feed */}
          <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider font-display flex items-center gap-1.5">
              <span>Viewer Experience Logs</span>
              <span className="bg-slate-900 text-amber-500 px-1.5 py-0.5 rounded text-[10px] font-black">{reviews.length}</span>
            </h3>

            {/* Input Form */}
            <form onSubmit={handleAddReview} className="space-y-3">
              <textarea
                value={newReviewText}
                onChange={(e) => setNewReviewText(e.target.value)}
                placeholder="Share your cinema experience..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors"
              />
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500 font-mono">Rating:</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReviewRating(star)}
                        className="cursor-pointer"
                      >
                        <Star className={`w-3.5 h-3.5 ${star <= newReviewRating ? 'text-amber-400 fill-current' : 'text-slate-700'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] rounded-lg tracking-wider uppercase transition-all cursor-pointer"
                >
                  Post Log
                </button>
              </div>
            </form>

            {/* Logs List */}
            <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-slate-950 border border-slate-900 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{rev.user}</span>
                    <span className="text-[9px] font-mono text-slate-600">{rev.date}</span>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'text-amber-400 fill-current' : 'text-slate-800'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">{rev.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Related Videos Section on the Bottom */}
      <section id="related-videos-section" className="border-t border-slate-900 pt-10 pb-4 space-y-6">
        <div>
          <h3 className="text-2xl font-black tracking-wider text-white font-display flex items-center gap-2">
            <Film className="w-5 h-5 text-amber-500" />
            <span>More Like This</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Handpicked cinema recommendations based on the current masterpiece.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedMovies.map((relMovie) => (
            <div 
              key={relMovie.id}
              onClick={() => onPlayMovie(relMovie)}
              className="bg-slate-900/60 hover:bg-slate-900 border border-slate-850 hover:border-slate-700/60 rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] flex flex-col group shadow-lg"
            >
              {/* Thumbnail with hover zoom */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                <img 
                  src={relMovie.thumbnailUrl} 
                  alt={relMovie.title} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Duration Badge */}
                <span className="absolute bottom-2.5 right-2.5 bg-slate-950/80 backdrop-blur-sm border border-slate-800 text-[10px] font-bold text-slate-300 px-2 py-0.5 rounded">
                  {relMovie.duration}
                </span>

                {/* Rating Badge */}
                <span className="absolute top-2.5 left-2.5 bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded">
                  {relMovie.rating}
                </span>

                {/* Hover Play Icon Overlay */}
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-10 h-10 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center font-black scale-90 group-hover:scale-100 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Card Meta details */}
              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">
                    {relMovie.genre}
                  </span>
                  <h4 className="text-sm font-bold text-white leading-tight group-hover:text-amber-400 transition-colors line-clamp-1">
                    {relMovie.title}
                  </h4>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>{relMovie.releaseYear}</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {relMovie.views.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
