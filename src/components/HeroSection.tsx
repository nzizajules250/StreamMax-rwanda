import { Play, Info, Heart, VolumeX, Volume2, Star, Film } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Movie } from '../types';

interface HeroSectionProps {
  featuredMovie: Movie;
  nextMovie: Movie | null;
  onPlay: (movie: Movie) => void;
  onDetail: (movie: Movie) => void;
  onLikeToggle: (movieId: string) => void;
  isLiked: boolean;
  onSwapFeatured: (movie: Movie) => void;
  moviesList?: Movie[];
}

export default function HeroSection({
  featuredMovie,
  nextMovie,
  onPlay,
  onDetail,
  onLikeToggle,
  isLiked,
  onSwapFeatured,
  moviesList = []
}: HeroSectionProps) {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Play video trailer on background loop when active
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {
        // Autoplay may be blocked initially, which is fine
      });
    }
  }, [featuredMovie]);

  // Fallback to custom list or moviesList
  const sliderMovies = moviesList && moviesList.length > 0 ? moviesList.slice(0, 6) : [];

  return (
    <div
      id="hero-section"
      className="relative w-full min-h-screen md:h-[100vh] bg-[#070101] overflow-hidden flex flex-col justify-between -mt-[88px]"
    >
      {/* 1. Absolute Background - Image and Video layers blending together */}
      <div className="absolute inset-0 z-0">
        {featuredMovie.trailerUrl ? (
          <video
            ref={videoRef}
            src={featuredMovie.trailerUrl}
            autoPlay
            muted={isMuted}
            loop
            playsInline
            className="w-full h-full object-cover opacity-35 transition-opacity duration-1000"
          />
        ) : (
          <img
            src={featuredMovie.thumbnailUrl}
            alt={featuredMovie.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-45 object-center md:object-right transition-opacity duration-500"
          />
        )}
        
        {/* If trailer is muted/stopped, show static poster background overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center md:bg-right opacity-40 mix-blend-lighten pointer-events-none"
          style={{ backgroundImage: `url(${featuredMovie.thumbnailUrl})` }}
        />

        {/* 2. Soft atmospheric gradient filters matching the screenshot */}
        {/* Left deep burgundy shadow overlay for text readability */}
        <div className="absolute inset-y-0 left-0 w-full md:w-3/5 bg-gradient-to-r from-[#070101] via-[#070101]/90 via-[#070101]/60 to-transparent z-10" />
        
        {/* Full-screen bottom-to-top gradient fading to solid deep red-black */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#070101] via-[#070101]/85 to-transparent z-10" />
        
        {/* Top-to-bottom soft shadow vignette */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#070101]/80 to-transparent z-10" />

        {/* 3. Red circular Runes / Mandala Symbol glow in background (like in the image) */}
        <div className="absolute right-0 md:right-10 top-1/2 -translate-y-1/2 w-[350px] h-[350px] md:w-[600px] md:h-[600px] rounded-full border border-red-950/20 bg-radial from-red-950/15 to-transparent blur-3xl -z-10 pointer-events-none animate-pulse duration-[6000ms]" />
      </div>

      {/* Hero Left Content Area */}
      <div className="relative z-20 flex-1 flex flex-col justify-center px-6 md:px-16 pt-24 max-w-2xl select-none text-left">
        {/* Season or Episode Number Badge */}
        <div className="mb-2">
          {featuredMovie.id === 'mandala' ? (
            <h2 className="text-xl md:text-2xl font-black font-sans tracking-wide text-slate-100 uppercase">
              Season 1
            </h2>
          ) : (
            <span className="px-3 py-1.5 bg-red-950/50 border border-red-900/40 text-red-400 text-[10px] font-bold uppercase rounded-md tracking-wider">
              {featuredMovie.genre} Release
            </span>
          )}
        </div>

        {/* Distressed Horror / Gothic Red Distressed Title to match Mandala Murders logo */}
        <h1 
          id="hero-title"
          className={`font-sans font-black uppercase mb-3 leading-[1.05] tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] ${
            featuredMovie.id === 'mandala' 
              ? 'text-red-600 text-5xl md:text-7xl font-display tracking-widest drop-shadow-[0_4px_12px_rgba(255,0,0,0.7)] animate-fadeIn font-extrabold' 
              : 'text-4xl md:text-6xl text-slate-100'
          }`}
          style={{
            textShadow: featuredMovie.id === 'mandala' ? '2px 2px 0px #000, -2px -2px 0px #000, 3px 3px 15px rgba(239, 68, 68, 0.9)' : 'none'
          }}
        >
          {featuredMovie.id === 'mandala' ? 'MANDALA MURDERS' : featuredMovie.title}
        </h1>

        {/* Star Rating to match exactly the 4 filled stars and 1 empty star in the image */}
        <div className="flex items-center gap-1.5 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <Star className="w-5 h-5 text-slate-400" />
          </div>
          <span className="text-xs font-bold text-slate-300 ml-1">
            ★ {featuredMovie.rating || '9.0'} Rating
          </span>
          <span className="text-slate-500 text-[10px] font-mono">•</span>
          <span className="text-slate-400 text-xs font-semibold">{featuredMovie.duration}</span>
        </div>

        {/* Crime | Drama | Mystery Genre Divider */}
        <div className="flex items-center gap-2 mb-4 font-sans text-xs font-bold text-slate-300">
          {featuredMovie.id === 'mandala' ? (
            <span>Crime | Drama | Mystery</span>
          ) : (
            <span>{featuredMovie.genre} | Cinema Blockbuster</span>
          )}
        </div>

        {/* Dynamic Description Box */}
        <p 
          id="hero-description"
          className="text-slate-300 text-sm md:text-[15px] max-w-lg leading-relaxed mb-6 font-medium text-shadow"
        >
          {featuredMovie.id === 'mandala' 
            ? 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'
            : featuredMovie.description
          }
        </p>

        {/* Hero Control Buttons styled exactly as in the image */}
        <div className="flex flex-wrap items-center gap-3.5 z-30">
          {/* Button 1: Beautiful teal-green rounded play-genre button */}
          <button
            id="hero-play-btn"
            onClick={() => onPlay(featuredMovie)}
            className="px-6 py-2.5 bg-[#00E6A2] hover:bg-[#00cc90] text-slate-950 font-black text-sm uppercase rounded-full flex items-center gap-2 shadow-lg shadow-teal-950/40 hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{featuredMovie.genre}</span>
          </button>

          {/* Button 2: Rounded outline Trailer button */}
          <button
            id="hero-info-btn"
            onClick={() => onDetail(featuredMovie)}
            className="px-6 py-2.5 bg-transparent hover:bg-white/5 border-2 border-white text-white font-bold text-sm uppercase rounded-full flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Trailer</span>
          </button>

          {/* Button 3: Minimal watchlist toggle */}
          <button
            id="hero-like-btn"
            onClick={() => onLikeToggle(featuredMovie.id)}
            className={`p-2.5 rounded-full transition-all border active:scale-90 cursor-pointer ${
              isLiked
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-black/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-black/60'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-red-400' : ''}`} />
          </button>

          {/* Button 4: Mute audio selector */}
          {featuredMovie.trailerUrl && (
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2.5 rounded-full border bg-black/40 border-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer active:scale-90 transition-all"
              title={isMuted ? 'Unmute audio' : 'Mute audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Bottom Horizontal Slider Panel - styled exactly like the screenshot inside 100vh */}
      <div className="relative z-20 w-full bg-gradient-to-t from-black via-black/90 to-transparent pb-8 pt-6 px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black tracking-widest text-[#00E600] uppercase font-sans flex items-center gap-1.5 drop-shadow-[0_0_8px_rgba(0,230,0,0.25)]">
              <Film className="w-3.5 h-3.5 text-[#00E600]" />
              <span>Cinematic Showcase Playlist</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Select to feature</span>
          </div>

          {/* The Horizontal Filmstrip Grid Slider */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4" id="hero-interactive-carousel">
            {sliderMovies.map((movie) => {
              const isSelected = movie.id === featuredMovie.id;
              return (
                <div
                  key={movie.id}
                  onClick={() => onSwapFeatured(movie)}
                  className={`relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group ${
                    isSelected
                      ? 'border-[3px] border-[#00E600] ring-4 ring-[#00E600]/20 scale-102 shadow-[0_0_15px_rgba(0,230,0,0.4)]'
                      : 'border border-slate-900/60 opacity-60 hover:opacity-100 hover:scale-102 hover:border-slate-700/50'
                  }`}
                >
                  {/* Poster Image */}
                  <img
                    src={movie.thumbnailUrl}
                    alt={movie.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Dark subtle shade inside posters */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                  {/* Floating badge for active selection indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-[#00E600] text-slate-950 text-[8px] font-black uppercase rounded shadow-sm">
                      Streaming
                    </div>
                  )}

                  {/* Movie Mini Details Card */}
                  <div className="absolute inset-x-0 bottom-0 p-2.5 text-left">
                    <h4 className="text-[11px] font-black text-white truncate uppercase font-sans leading-tight">
                      {movie.title}
                    </h4>
                    <span className="text-[8px] font-bold text-slate-400 mt-0.5 block">
                      {movie.genre} • {movie.releaseYear}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
