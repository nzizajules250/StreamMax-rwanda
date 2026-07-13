import { Clock, Trash2, Heart, Award, Sparkles, AlertCircle, Play } from 'lucide-react';
import { User, Movie } from '../types';

interface UserProfileProps {
  currentUser: User | null;
  movies: Movie[];
  onRemoveFromWatchlist: (movieId: string) => void;
  onPlayMovie: (movie: Movie) => void;
  onOpenSubscription: () => void;
}

export default function UserProfile({
  currentUser,
  movies,
  onRemoveFromWatchlist,
  onPlayMovie,
  onOpenSubscription
}: UserProfileProps) {
  if (!currentUser) return null;

  // Resolve movies in watchlist
  const watchlistMovies = movies.filter(m => currentUser.watchlist.includes(m.id));

  // Resolve viewing history
  const historyItems = currentUser.history.map(item => {
    const movieObj = movies.find(m => m.id === item.movieId);
    return {
      ...item,
      movie: movieObj
    };
  }).filter(item => item.movie !== undefined);

  return (
    <div id="user-profile-view" className="max-w-6xl mx-auto py-8 px-4 space-y-8 animate-fadeIn">
      {/* Header Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 blur-3xl rounded-full" />
        
        <div className="flex items-center gap-5 flex-col md:flex-row text-center md:text-left">
          <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center font-black text-3xl text-slate-950 shadow-md">
            {currentUser.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <h3 className="text-3xl font-black font-display tracking-wider uppercase">{currentUser.username}</h3>
              {currentUser.role === 'admin' && (
                <span className="bg-amber-500 text-slate-950 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Admin
                </span>
              )}
            </div>
            <p className="text-slate-400 text-xs mt-1">{currentUser.email}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Member since {new Date(currentUser.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Subscription Status Card */}
        <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-850/80 w-full md:w-80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plan Status</span>
            {currentUser.subscription?.active ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <Sparkles className="w-3 h-3 fill-current" />
                <span>PREMIUM PASS</span>
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-bold bg-slate-800 px-2 py-0.5 rounded">
                FREE TIER
              </span>
            )}
          </div>

          {currentUser.subscription?.active ? (
            <div id="active-subscription-info">
              <p className="text-sm font-bold text-slate-100">Unlimited Theater Access</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Renews automatically next month
              </p>
            </div>
          ) : (
            <div id="inactive-subscription-info" className="space-y-3">
              <p className="text-xs text-slate-400 leading-relaxed">
                Unlock 4K streaming, high-quality audio, and all blockbuster titles!
              </p>
              <button
                id="profile-upgrade-btn"
                onClick={onOpenSubscription}
                className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
              >
                Upgrade to Abonnement
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-lg font-bold">{historyItems.length}</h4>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Movies Watched</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-lg">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-lg font-bold">{currentUser.watchlist?.length || 0}</h4>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Saved Queue</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl flex items-center gap-3 col-span-2 md:col-span-1">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-lg font-bold">{currentUser.subscription?.active ? 'Gold Elite' : 'Standard'}</h4>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Member Tier</p>
          </div>
        </div>
      </div>

      {/* Watchlist Section */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold font-display tracking-wider text-white flex items-center gap-2 uppercase">
          <span>My Personal Watchlist</span>
          <span className="text-xs text-slate-400 font-medium font-sans lowercase">({watchlistMovies.length} saved)</span>
        </h3>

        {watchlistMovies.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-850/80">
            <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Your watchlist is currently empty. Start exploring movies to add items!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="profile-watchlist-grid">
            {watchlistMovies.map((movie) => (
              <div key={movie.id} className="relative group bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden aspect-[16/10]">
                <img
                  src={movie.thumbnailUrl}
                  alt={movie.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                
                <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col justify-end">
                  <h5 className="font-extrabold text-white text-sm truncate">{movie.title}</h5>
                  <p className="text-slate-400 text-xs mt-0.5">{movie.genre} • {movie.duration}</p>
                  
                  <div className="mt-3 flex gap-2">
                    <button
                      id={`profile-watchlist-play-${movie.id}`}
                      onClick={() => onPlayMovie(movie)}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Watch</span>
                    </button>
                    <button
                      id={`profile-watchlist-remove-${movie.id}`}
                      onClick={() => onRemoveFromWatchlist(movie.id)}
                      className="p-1.5 bg-rose-500/15 text-rose-400 border border-rose-500/25 rounded-xl hover:bg-rose-500/25 transition-colors cursor-pointer"
                      title="Remove from watchlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Viewing History list */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold font-display tracking-wider text-white flex items-center gap-2 uppercase">
          <span>Viewing History</span>
          <span className="text-xs text-slate-400 font-medium font-sans lowercase">({historyItems.length} records)</span>
        </h3>

        {historyItems.length === 0 ? (
          <div className="text-center py-8 bg-slate-900/40 rounded-2xl border border-slate-850/80">
            <p className="text-slate-400 text-sm">No streaming history recorded yet. Open videos to track progress!</p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden divide-y divide-slate-850" id="profile-history-list">
            {historyItems.map((item, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-850/20 transition-colors">
                <div className="flex items-center gap-3 truncate">
                  <img
                    src={item.movie?.thumbnailUrl}
                    alt={item.movie?.title}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="truncate">
                    <h5 className="font-bold text-white text-sm truncate">{item.movie?.title}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Streamed on {new Date(item.watchedAt).toLocaleDateString()} at {new Date(item.watchedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs text-slate-400">Completed</span>
                    <p className="text-xs text-amber-400 font-bold">{item.progress}%</p>
                  </div>
                  <button
                    id={`profile-history-replay-${item.movie?.id}`}
                    onClick={() => onPlayMovie(item.movie!)}
                    className="p-2.5 bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 rounded-xl transition-all cursor-pointer border border-slate-700/50"
                    title="Watch Again"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
