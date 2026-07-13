import { useState } from 'react';
import { Play, Info, Heart, Eye } from 'lucide-react';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  onPlay: (movie: Movie) => void;
  onDetail: (movie: Movie) => void;
  onLikeToggle: (movieId: string) => void;
  isLiked: boolean;
  isSubscribed: boolean;
  key?: string | number;
}

export default function MovieCard({
  movie,
  onPlay,
  onDetail,
  onLikeToggle,
  isLiked,
  isSubscribed
}: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      id={`movie-card-${movie.id}`}
      className="relative group bg-brand-elevation-1 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-350 transform hover:-translate-y-1.5 border border-slate-900 hover:border-[#00E600]/50 cursor-pointer aspect-[16/10]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image / Thumbnail */}
      <img
        id={`movie-img-${movie.id}`}
        src={movie.thumbnailUrl}
        alt={movie.title}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Dark Gradient Overlay - Scrim that deepens bottom-up */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-300" />

      {/* Content Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col justify-end min-h-[50%]">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-950/60 border border-slate-900 text-[#00E6A2] rounded-md font-sans tracking-wider">
            {movie.genre}
          </span>
          <span className="text-[10px] font-medium text-slate-300">
            {movie.releaseYear}
          </span>
          <span className="text-[10px] text-slate-400">•</span>
          <span className="text-[10px] font-medium text-slate-300">
            {movie.duration}
          </span>
          <span className="text-[10px] font-black text-[#00E600] bg-[#00E600]/10 px-1.5 rounded">
            ★ {movie.rating}
          </span>
        </div>

        <h4 className="text-xl font-extrabold text-white truncate tracking-wide font-sans uppercase">
          {movie.title}
        </h4>

        {/* Hover Action Panel - slide in and fade on hover */}
        <div 
          id={`movie-actions-${movie.id}`}
          className={`mt-3 flex items-center justify-between gap-2 overflow-hidden transition-all duration-300 ${
            isHovered ? 'opacity-100 max-h-12 translate-y-0' : 'opacity-0 max-h-0 translate-y-2'
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              id={`movie-play-btn-${movie.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onPlay(movie);
              }}
              className="px-3.5 py-1.5 bg-gradient-to-r from-[#00E600] to-[#00E6A2] text-slate-950 rounded-xl hover:brightness-110 active:scale-95 transition-all flex items-center gap-1 text-[11px] font-black uppercase tracking-wider shadow-md shadow-teal-950/20 cursor-pointer font-sans"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Play</span>
            </button>

            <button
              id={`movie-detail-btn-${movie.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onDetail(movie);
              }}
              className="px-2.5 py-1.5 bg-slate-900 text-slate-100 hover:bg-slate-800 active:scale-95 transition-all rounded-xl border border-slate-800 flex items-center gap-1 text-[11px] font-bold cursor-pointer"
            >
              <Info className="w-3 h-3" />
              <span>Details</span>
            </button>
          </div>

          <button
            id={`movie-like-btn-${movie.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onLikeToggle(movie.id);
            }}
            className={`p-1.5 rounded-xl transition-all border cursor-pointer active:scale-90 ${
              isLiked 
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 hover:bg-rose-500/30' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current text-rose-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Viewing Status Badges (Always Visible on Side) */}
      <div className="absolute top-3 left-3 flex gap-1.5 items-center pointer-events-none">
        <span className="flex items-center gap-0.5 text-[9px] font-bold bg-slate-950/85 backdrop-blur-md px-1.5 py-0.5 rounded text-slate-300 border border-slate-900">
          <Eye className="w-2.5 h-2.5 text-slate-400" />
          {(movie.views > 1000 ? `${(movie.views/1000).toFixed(1)}k` : movie.views)}
        </span>
      </div>
    </div>
  );
}
