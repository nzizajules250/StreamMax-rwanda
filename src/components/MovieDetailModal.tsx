import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Plus, Check, Heart, Clock, Star, Volume2, Maximize, PlayCircle } from 'lucide-react';
import { Movie, User } from '../types';

interface MovieDetailModalProps {
  movie: Movie | null;
  onClose: () => void;
  currentUser: User | null;
  onPlay: (movie: Movie) => void;
  onLikeToggle: (movieId: string) => void;
  onWatchlistToggle: (movieId: string) => void;
  isLiked: boolean;
  isWatchlisted: boolean;
  isSubscribed: boolean;
}

export default function MovieDetailModal({
  movie,
  onClose,
  currentUser,
  onPlay,
  onLikeToggle,
  onWatchlistToggle,
  isLiked,
  isWatchlisted,
  isSubscribed
}: MovieDetailModalProps) {
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // Reset video playing state when movie changes
    setIsPlayingVideo(false);
  }, [movie]);

  if (!movie) return null;

  const handleStartPlayback = () => {
    if (!isSubscribed) {
      onPlay(movie); // Trigger subscribe warning in parent
    } else {
      setIsPlayingVideo(true);
      onPlay(movie); // Track history
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          id="detail-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          id="detail-modal-window"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative bg-slate-950 border border-slate-800/80 rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl z-10 text-slate-100 flex flex-col md:flex-row"
        >
          {/* Close Button */}
          <button
            id="close-detail-modal"
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-100 transition-colors p-2 rounded-full hover:bg-slate-800/80 cursor-pointer z-20"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Left / Top Side: Media Player or Banner */}
          <div className="w-full md:w-[55%] relative aspect-video md:aspect-auto bg-black flex flex-col justify-center min-h-[280px] md:min-h-[500px]">
            {isPlayingVideo ? (
              <div className="w-full h-full relative" id="active-video-player">
                <video
                  ref={videoRef}
                  src={movie.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain md:max-h-[600px]"
                />
                <button
                  id="stop-video-playback"
                  onClick={() => setIsPlayingVideo(false)}
                  className="absolute bottom-4 right-4 bg-red-600 hover:bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold cursor-pointer"
                >
                  Exit Player
                </button>
              </div>
            ) : (
              <div className="w-full h-full relative group">
                {/* Backdrop Image */}
                <img
                  id="detail-banner-img"
                  src={movie.thumbnailUrl}
                  alt={movie.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-60 absolute inset-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                {/* Big Floating Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.button
                    id="hero-modal-play-trigger"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStartPlayback}
                    className="w-20 h-20 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-full flex items-center justify-center cursor-pointer shadow-2xl shadow-amber-950/50"
                  >
                    <Play className="w-9 h-9 fill-current translate-x-1 text-slate-950" />
                  </motion.button>
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                  <span className="px-3 py-1 bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-widest rounded-full">
                    {movie.genre}
                  </span>
                  <p className="text-xs text-slate-300 mt-2.5 font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Duration: {movie.duration}</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right / Bottom Side: Detailed Metadata */}
          <div className="w-full md:w-[45%] p-6 md:p-8 flex flex-col justify-between bg-slate-950">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-slate-800 px-2 py-0.5 rounded text-xs font-bold text-slate-300">
                  {movie.releaseYear}
                </span>
                <span className="bg-slate-800 px-2 py-0.5 rounded text-xs font-bold text-amber-400">
                  ★ {movie.rating}
                </span>
                <span className="text-xs text-slate-400">
                  {(movie.views > 1000 ? `${(movie.views/1000).toFixed(1)}k` : movie.views)} views
                </span>
              </div>

              <h3 className="text-3xl md:text-4xl font-black font-display tracking-wider uppercase mb-4">
                {movie.title}
              </h3>

              <p className="text-slate-300 text-sm leading-relaxed mb-6 font-medium">
                {movie.description}
              </p>

              <div className="space-y-4 border-t border-slate-900 pt-6">
                <div>
                  <h5 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 font-display">Cast & Stars</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {movie.cast.map((member, idx) => (
                      <span key={idx} className="bg-slate-900 border border-slate-800/60 px-3 py-1 rounded-full text-xs font-medium text-slate-200">
                        {member}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 font-display">About</h5>
                  <table className="w-full text-xs text-slate-300">
                    <tbody>
                      <tr className="border-b border-slate-900/45">
                        <td className="py-1.5 text-slate-400">Main Genre</td>
                        <td className="py-1.5 font-semibold text-right">{movie.genre}</td>
                      </tr>
                      <tr className="border-b border-slate-900/45">
                        <td className="py-1.5 text-slate-400">Year Published</td>
                        <td className="py-1.5 font-semibold text-right">{movie.releaseYear}</td>
                      </tr>
                      <tr className="border-b border-slate-900/45">
                        <td className="py-1.5 text-slate-400">Viewer Rating</td>
                        <td className="py-1.5 font-semibold text-right text-amber-400">★ {movie.rating} / 10</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 text-slate-400">Simulated Upload Status</td>
                        <td className="py-1.5 font-semibold text-emerald-400 text-right">Cloudinary Secured</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="mt-8 pt-6 border-t border-slate-900 flex items-center gap-3">
              <button
                id="modal-play-btn"
                onClick={handleStartPlayback}
                className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <PlayCircle className="w-5 h-5 fill-current" />
                <span>Watch {isSubscribed ? 'Free' : 'Trailer'}</span>
              </button>

              <button
                id="modal-watchlist-btn"
                onClick={() => onWatchlistToggle(movie.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isWatchlisted
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
                title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                {isWatchlisted ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </button>

              <button
                id="modal-like-btn"
                onClick={() => onLikeToggle(movie.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isLiked
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
                title={isLiked ? 'Unlike Movie' : 'Like Movie'}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current text-rose-400' : ''}`} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
