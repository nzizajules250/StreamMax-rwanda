import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, PlusCircle, Film, Users, Trash2, Edit3, Grid, List, 
  Upload, Sparkles, TrendingUp, DollarSign, Eye, Play, Star, Calendar, Clock, Check, Settings,
  Tv, Plus
} from 'lucide-react';
import { Movie, User, PlatformStats, Episode } from '../types';
import { GENRES } from '../data/mockMovies';
import { uploadToCloudinary } from '../lib/cloudinary';

interface AdminDashboardProps {
  movies: Movie[];
  users: User[];
  onAddMovie: (newMovie: Omit<Movie, 'id' | 'views' | 'likes' | 'createdAt'>) => void;
  onDeleteMovie: (id: string) => void;
  onUpdateUserSubscription: (userId: string, active: boolean, planId?: string) => void;
  addToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export default function AdminDashboard({
  movies,
  users,
  onAddMovie,
  onDeleteMovie,
  onUpdateUserSubscription,
  addToast
}: AdminDashboardProps) {
  const [adminTab, setAdminTab] = useState<'analytics' | 'add-movie' | 'movies-list' | 'users'>('analytics');
  
  // Movie Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('Action');
  const [releaseYear, setReleaseYear] = useState<number>(2026);
  const [duration, setDuration] = useState('2h 10m');
  const [rating, setRating] = useState('PG-13');
  const [castStr, setCastStr] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4');
  
  // Custom content types and uploader configuration
  const [contentType, setContentType] = useState<'movie' | 'series'>('movie');
  const [thumbnailSourceMode, setThumbnailSourceMode] = useState<'upload' | 'url'>('upload');
  const [videoSourceMode, setVideoSourceMode] = useState<'upload' | 'url'>('url');

  // Episodes State for Series
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [episodeSourceMode, setEpisodeSourceMode] = useState<'upload' | 'url'>('url');
  const [bulkEpisodeUrls, setBulkEpisodeUrls] = useState('');
  const [isUploadingEpisodes, setIsUploadingEpisodes] = useState(false);
  const [episodesUploadProgress, setEpisodesUploadProgress] = useState(0);
  const [currentUploadingIndex, setCurrentUploadingIndex] = useState(0);
  const [totalUploadingCount, setTotalUploadingCount] = useState(0);
  const episodesInputRef = useRef<HTMLInputElement | null>(null);
  
  // Cloudinary credentials & config state
  const [cloudinaryCloudName, setCloudinaryCloudName] = useState(
    (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME || localStorage.getItem('cloudinary_cloud_name') || ''
  );
  const [cloudinaryUploadPreset, setCloudinaryUploadPreset] = useState(
    (import.meta as any).env.VITE_CLOUDINARY_UPLOAD_PRESET || localStorage.getItem('cloudinary_upload_preset') || ''
  );
  const [showCloudinaryConfig, setShowCloudinaryConfig] = useState(false);

  // Cloudinary Upload states - Thumbnail (Image)
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [thumbnailUploadProgress, setThumbnailUploadProgress] = useState(0);
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);

  // Cloudinary Upload states - Video (Movie)
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  // Filter in admin movies list
  const [adminGenreFilter, setAdminGenreFilter] = useState('All');
  const [adminYearFilter, setAdminYearFilter] = useState('All');
  const [adminViewMode, setAdminViewMode] = useState<'grid' | 'list'>('grid');

  // Local storage caching for credentials
  const handleSaveCloudinaryConfig = (cloud: string, preset: string) => {
    setCloudinaryCloudName(cloud);
    setCloudinaryUploadPreset(preset);
    localStorage.setItem('cloudinary_cloud_name', cloud);
    localStorage.setItem('cloudinary_upload_preset', preset);
    addToast('Cloudinary credentials cached successfully!', 'success');
  };

  // Fallback simulator if Cloudinary is not yet configured
  const runSimulatedUpload = (file: File, type: 'thumbnail' | 'video') => {
    if (type === 'thumbnail') {
      setIsUploadingThumbnail(true);
      setThumbnailUploadProgress(10);
    } else {
      setIsUploadingVideo(true);
      setVideoUploadProgress(10);
    }

    let progress = 10;
    const interval = setInterval(() => {
      progress += 25;
      if (type === 'thumbnail') {
        setThumbnailUploadProgress(Math.min(100, progress));
      } else {
        setVideoUploadProgress(Math.min(100, progress));
      }

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          if (type === 'thumbnail') {
            setIsUploadingThumbnail(false);
            const mockUrl = `https://res.cloudinary.com/cinemastream/image/upload/v17208756/movies/${file.name.replace(/\s+/g, '_')}`;
            setThumbnailUrl(mockUrl);
            addToast(`[Demo mode] Successfully uploaded poster to Cloudinary CDN!`, 'success');
          } else {
            setIsUploadingVideo(false);
            const mockUrl = `https://res.cloudinary.com/cinemastream/video/upload/v17208756/movies/${file.name.replace(/\s+/g, '_')}`;
            setVideoUrl(mockUrl);
            addToast(`[Demo mode] Successfully uploaded video to Cloudinary CDN!`, 'success');
          }
        }, 500);
      }
    }, 200);
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
      addToast('Cloudinary credentials missing. Defaulting to Demo Mode upload...', 'info');
      runSimulatedUpload(file, 'thumbnail');
      return;
    }

    setIsUploadingThumbnail(true);
    setThumbnailUploadProgress(0);

    try {
      const secureUrl = await uploadToCloudinary(
        file,
        cloudinaryCloudName,
        cloudinaryUploadPreset,
        (progress) => setThumbnailUploadProgress(progress)
      );
      setThumbnailUrl(secureUrl);
      addToast(`Poster artwork "${file.name}" uploaded successfully to Cloudinary!`, 'success');
    } catch (err: any) {
      console.warn(err);
      addToast(`Cloudinary upload failed: ${err.message || err}. Running Demo fallback.`, 'warning');
      runSimulatedUpload(file, 'thumbnail');
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
      addToast('Cloudinary credentials missing. Defaulting to Demo Mode upload...', 'info');
      runSimulatedUpload(file, 'video');
      return;
    }

    setIsUploadingVideo(true);
    setVideoUploadProgress(0);

    try {
      const secureUrl = await uploadToCloudinary(
        file,
        cloudinaryCloudName,
        cloudinaryUploadPreset,
        (progress) => setVideoUploadProgress(progress)
      );
      setVideoUrl(secureUrl);
      addToast(`Movie video file "${file.name}" uploaded successfully to Cloudinary!`, 'success');
    } catch (err: any) {
      console.warn(err);
      addToast(`Cloudinary upload failed: ${err.message || err}. Running Demo fallback.`, 'warning');
      runSimulatedUpload(file, 'video');
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleBulkEpisodesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filesArray: File[] = Array.from(files);
    setTotalUploadingCount(filesArray.length);
    setIsUploadingEpisodes(true);
    setEpisodesUploadProgress(0);

    const uploadedEpisodes: Episode[] = [...episodes];

    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      setCurrentUploadingIndex(i + 1);
      setEpisodesUploadProgress(0);

      let secureUrl = '';
      if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
        // Simulation mode
        await new Promise<void>((resolve) => {
          let progress = 0;
          const interval = setInterval(() => {
            progress += 25;
            setEpisodesUploadProgress(Math.min(100, progress));
            if (progress >= 100) {
              clearInterval(interval);
              resolve();
            }
          }, 150);
        });
        secureUrl = `https://res.cloudinary.com/cinemastream/video/upload/v17208756/movies/episode_${uploadedEpisodes.length + 1}_${file.name.replace(/\s+/g, '_')}`;
      } else {
        try {
          secureUrl = await uploadToCloudinary(
            file,
            cloudinaryCloudName,
            cloudinaryUploadPreset,
            (progress) => setEpisodesUploadProgress(progress)
          );
        } catch (err: any) {
          console.warn(err);
          addToast(`Upload failed for "${file.name}". Falling back to Simulated CDN.`, 'warning');
          secureUrl = `https://res.cloudinary.com/cinemastream/video/upload/v17208756/movies/episode_${uploadedEpisodes.length + 1}_${file.name.replace(/\s+/g, '_')}`;
        }
      }

      const epNumber = uploadedEpisodes.length + 1;
      uploadedEpisodes.push({
        id: `ep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        episodeNumber: epNumber,
        seasonNumber: 1,
        title: `Episode ${epNumber}: ${file.name.replace(/\.[^/.]+$/, "")}`,
        duration: '45m',
        videoUrl: secureUrl
      });
      setEpisodes([...uploadedEpisodes]);
    }

    setIsUploadingEpisodes(false);
    addToast(`Successfully uploaded ${filesArray.length} episodes all at once!`, 'success');
  };

  const handleBulkEpisodeUrlsAdd = () => {
    if (!bulkEpisodeUrls.trim()) {
      addToast('Please enter at least one URL.', 'warning');
      return;
    }
    const urls = bulkEpisodeUrls.split('\n').map(u => u.trim()).filter(Boolean);
    if (urls.length === 0) {
      addToast('No valid URLs found.', 'warning');
      return;
    }

    const currentCount = episodes.length;
    const generated: Episode[] = urls.map((url, index) => {
      const epNumber = currentCount + index + 1;
      return {
        id: `ep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        episodeNumber: epNumber,
        seasonNumber: 1,
        title: `Episode ${epNumber}`,
        duration: '45m',
        videoUrl: url
      };
    });

    setEpisodes([...episodes, ...generated]);
    setBulkEpisodeUrls('');
    addToast(`Successfully registered ${generated.length} episode links!`, 'success');
  };

  const handleUpdateEpisodeField = (id: string, field: keyof Episode, value: any) => {
    setEpisodes(prev => prev.map(ep => {
      if (ep.id === id) {
        return { ...ep, [field]: value };
      }
      return ep;
    }));
  };

  const handleDeleteEpisode = (id: string) => {
    setEpisodes(prev => prev.filter(ep => ep.id !== id).map((ep, idx) => ({
      ...ep,
      episodeNumber: idx + 1
    })));
    addToast('Episode removed.', 'info');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (contentType === 'movie') {
      if (!title || !description || !thumbnailUrl || !videoUrl) {
        addToast('Please complete all fields and provide both poster and video.', 'error');
        return;
      }
    } else {
      if (!title || !description || !thumbnailUrl) {
        addToast('Please complete all fields and provide a poster for the series.', 'error');
        return;
      }
      if (episodes.length === 0) {
        addToast('Please upload or add at least one episode to create a TV Show series.', 'error');
        return;
      }
    }

    const castList = castStr ? castStr.split(',').map(s => s.trim()) : ['Unspecified Stars'];

    const finalVideoUrl = contentType === 'series' 
      ? (videoUrl && videoUrl !== 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' ? videoUrl : episodes[0]?.videoUrl || '') 
      : videoUrl;

    const finalDuration = contentType === 'series'
      ? `${episodes.length} Episode${episodes.length > 1 ? 's' : ''}`
      : duration;

    onAddMovie({
      title,
      description,
      genre,
      releaseYear,
      duration: finalDuration,
      rating,
      cast: castList,
      thumbnailUrl,
      trailerUrl: finalVideoUrl, 
      videoUrl: finalVideoUrl,
      isFeatured: false,
      type: contentType,
      episodes: contentType === 'series' ? episodes : undefined
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setGenre('Action');
    setReleaseYear(2026);
    setDuration('2h 10m');
    setRating('PG-13');
    setCastStr('');
    setThumbnailUrl('');
    setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4');
    setEpisodes([]);
    setBulkEpisodeUrls('');
    setContentType('movie');
    setThumbnailSourceMode('upload');
    setVideoSourceMode('url');

    addToast(`Successfully published ${contentType === 'series' ? 'TV Show Series' : 'Movie'} to catalog!`, 'success');
    setAdminTab('movies-list');
  };

  // Calculate platform analytics
  const totalViews = movies.reduce((sum, m) => sum + m.views, 0);
  const totalLikes = movies.reduce((sum, m) => sum + m.likes, 0);
  const subscribedUsersCount = users.filter(u => u.subscription?.active).length;
  const estimatedRevenue = subscribedUsersCount * 14.99; // Average plan price

  return (
    <div id="admin-dashboard-layout" className="flex flex-col md:flex-row min-h-[600px] border border-slate-800/80 rounded-3xl overflow-hidden bg-slate-950 text-slate-100">
      {/* Sidebar navigation */}
      <div className="w-full md:w-64 bg-slate-900/60 border-b md:border-b-0 md:border-r border-slate-850 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-amber-500 text-slate-950 rounded-xl flex items-center justify-center font-bold">
              ADM
            </div>
            <div>
              <h4 className="text-sm font-extrabold tracking-tight">Admin Terminal</h4>
              <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-widest">Platform Control</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              id="admin-nav-analytics"
              onClick={() => setAdminTab('analytics')}
              className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold transition-all cursor-pointer ${
                adminTab === 'analytics'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Performance Logs</span>
            </button>

            <button
              id="admin-nav-add-movie"
              onClick={() => setAdminTab('add-movie')}
              className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold transition-all cursor-pointer ${
                adminTab === 'add-movie'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Movie</span>
            </button>

            <button
              id="admin-nav-movies-list"
              onClick={() => setAdminTab('movies-list')}
              className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold transition-all cursor-pointer ${
                adminTab === 'movies-list'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Manage Movies</span>
            </button>

            <button
              id="admin-nav-users"
              onClick={() => setAdminTab('users')}
              className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold transition-all cursor-pointer ${
                adminTab === 'users'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Manage Users</span>
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-850 hidden md:block">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850">
            <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest block mb-1">
              Active Storage Node
            </span>
            <p className="text-xs text-slate-300 font-bold truncate">Cloudinary Secure S3</p>
            <div className="flex items-center gap-1 mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-slate-400 font-semibold">Online & Synchronized</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[85vh]">
        {adminTab === 'analytics' && (
          <div id="analytics-panel" className="space-y-8 animate-fadeIn">
            <div>
              <h3 className="text-2xl font-black font-sans tracking-tight">Performance Statistics</h3>
              <p className="text-slate-400 text-xs mt-1">Track website views, subscriptions, and platform expansion.</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl">
                <div className="flex items-center justify-between text-slate-400 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Views</span>
                  <Eye className="w-4 h-4 text-amber-500" />
                </div>
                <h4 className="text-2xl font-black">{totalViews.toLocaleString()}</h4>
                <p className="text-[10px] text-emerald-400 font-bold mt-1">↑ 14% this week</p>
              </div>

              <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl">
                <div className="flex items-center justify-between text-slate-400 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider">Subscribers</span>
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="text-2xl font-black">{subscribedUsersCount}</h4>
                <p className="text-[10px] text-amber-400 font-bold mt-1">
                  {((subscribedUsersCount / (users.length || 1)) * 100).toFixed(0)}% conversion rate
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl">
                <div className="flex items-center justify-between text-slate-400 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Likes</span>
                  <Star className="w-4 h-4 text-rose-500" />
                </div>
                <h4 className="text-2xl font-black">{totalLikes.toLocaleString()}</h4>
                <p className="text-[10px] text-emerald-400 font-bold mt-1">↑ 2.1k brand new</p>
              </div>

              <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl">
                <div className="flex items-center justify-between text-slate-400 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider">Est. Monthly Revenue</span>
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                </div>
                <h4 className="text-2xl font-black">${estimatedRevenue.toFixed(2)}</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">Based on active abonnements</p>
              </div>
            </div>

            {/* Custom Interactive SVG Dashboard Chart */}
            <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider">Simulated Traffic Growth</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Estimated viewer streams over past 6 months</p>
                </div>
                <span className="px-2.5 py-1 bg-slate-950 border border-slate-850 rounded-lg text-xs font-semibold text-slate-300">
                  Daily Streams (thousands)
                </span>
              </div>

              <div className="w-full h-48 flex items-end justify-between gap-2.5 pt-4 border-b border-slate-800">
                {[
                  { label: 'Jan', val: 30 },
                  { label: 'Feb', val: 45 },
                  { label: 'Mar', val: 78 },
                  { label: 'Apr', val: 92 },
                  { label: 'May', val: 120 },
                  { label: 'Jun', val: 145 }
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-[10px] font-bold text-amber-400">{item.val}k</span>
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${(item.val / 160) * 100}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="w-full bg-gradient-to-t from-orange-500 to-amber-400 rounded-t-lg origin-bottom"
                    />
                    <span className="text-[10px] text-slate-400 font-bold mt-1">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Health Section */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl">
                <h5 className="text-xs font-bold uppercase tracking-wider mb-4">Genre Popularity Index</h5>
                <div className="space-y-3">
                  {[
                    { genre: 'Sci-Fi', count: 48 },
                    { genre: 'Action', count: 32 },
                    { genre: 'Fantasy', count: 12 },
                    { genre: 'Animation', count: 8 }
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-300">{item.genre}</span>
                        <span className="text-slate-400">{item.count}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: `${item.count}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider mb-2">Cloudinary Integration Status</h5>
                  <p className="text-slate-400 text-xs mb-4">All thumbnails and full movie streams are securely synchronized on Cloudinary CDN nodes.</p>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-800/55">
                    <span className="text-slate-400">Secure API Token</span>
                    <span className="font-mono text-[10px] text-slate-300">••••••••f98s</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/55">
                    <span className="text-slate-400">Total Asset Bandwidth</span>
                    <span className="font-semibold text-slate-200">12.4 GB / Unlimited</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Upload Engine Latency</span>
                    <span className="text-emerald-400 font-bold">140ms (Optimized)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {adminTab === 'add-movie' && (
          <div id="add-movie-panel" className="max-w-2xl animate-fadeIn space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black font-sans tracking-tight text-white">Upload New Blockbuster</h3>
                <p className="text-slate-400 text-xs mt-1">Fill out metadata details and process artwork and video streams via Cloudinary.</p>
              </div>
              <button 
                type="button"
                onClick={() => setShowCloudinaryConfig(!showCloudinaryConfig)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Cloudinary Settings</span>
              </button>
            </div>

            {/* Cloudinary credentials editor */}
            {showCloudinaryConfig && (
              <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-3 animate-fadeIn">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Cloudinary API Configuration</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cloud Name</label>
                    <input 
                      type="text" 
                      value={cloudinaryCloudName}
                      onChange={(e) => handleSaveCloudinaryConfig(e.target.value, cloudinaryUploadPreset)}
                      placeholder="Enter cloud name"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Upload Preset</label>
                    <input 
                      type="text" 
                      value={cloudinaryUploadPreset}
                      onChange={(e) => handleSaveCloudinaryConfig(cloudinaryCloudName, e.target.value)}
                      placeholder="Enter unsigned preset"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500">
                  Credentials are automatically synced from your project's .env configuration or custom inputs cached in local storage.
                </p>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-5">
              {/* CONTENT TYPE SELECTOR */}
              <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Choose Production Category</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Toggle between Single Movies or Multi-Episode TV Series collections.</p>
                </div>
                <div className="flex gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setContentType('movie');
                      setDuration('2h 10m');
                    }}
                    className={`px-4 py-2 text-xs font-black rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                      contentType === 'movie'
                        ? 'bg-amber-500 text-slate-950 font-black shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Single Movie</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setContentType('series');
                      setDuration('');
                    }}
                    className={`px-4 py-2 text-xs font-black rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                      contentType === 'series'
                        ? 'bg-amber-500 text-slate-950 font-black shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Tv className="w-3.5 h-3.5" />
                    <span>TV Show Series</span>
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Production Title</label>
                  <input
                    id="admin-form-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={contentType === 'series' ? "e.g. Cosmos (Season 1)" : "e.g. Gravity Bound"}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Genre</label>
                  <select
                    id="admin-form-genre"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
                  >
                    {GENRES.filter(g => g !== 'All').map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description & Storyline</label>
                <textarea
                  id="admin-form-desc"
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize the storyline, conflict, and cinematic tone..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Release Year</label>
                  <input
                    id="admin-form-year"
                    type="number"
                    required
                    value={releaseYear}
                    onChange={(e) => setReleaseYear(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Duration</label>
                  <input
                    id="admin-form-duration"
                    type="text"
                    required={contentType === 'movie'}
                    disabled={contentType === 'series'}
                    value={contentType === 'series' ? `${episodes.length} Episode${episodes.length !== 1 ? 's' : ''}` : duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder={contentType === 'series' ? "Auto-managed" : "e.g. 2h 15m"}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Content Rating</label>
                  <input
                    id="admin-form-rating"
                    type="text"
                    required
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    placeholder="e.g. PG-13, R, TV-MA"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Starring Cast (Comma Separated)</label>
                <input
                  id="admin-form-cast"
                  type="text"
                  value={castStr}
                  onChange={(e) => setCastStr(e.target.value)}
                  placeholder="Matthew McConaughey, Anne Hathaway, Jessica Chastain"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* POSTER / THUMBNAIL SOURCE SELECTOR */}
              <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-850/60 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Movie Poster Artwork</label>
                    <p className="text-[10px] text-slate-500 mt-0.5">Provide cover image via local computer upload or direct HTTPS link.</p>
                  </div>
                  <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setThumbnailSourceMode('upload')}
                      className={`px-3 py-1 text-[10px] font-black rounded-md transition-colors cursor-pointer ${
                        thumbnailSourceMode === 'upload' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setThumbnailSourceMode('url')}
                      className={`px-3 py-1 text-[10px] font-black rounded-md transition-colors cursor-pointer ${
                        thumbnailSourceMode === 'url' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Paste URL
                    </button>
                  </div>
                </div>

                {thumbnailSourceMode === 'upload' ? (
                  <div className="bg-slate-900/60 border-2 border-dashed border-slate-800 rounded-xl p-5 text-center">
                    <input
                      type="file"
                      ref={thumbnailInputRef}
                      onChange={handleThumbnailUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    {isUploadingThumbnail ? (
                      <div className="space-y-3" id="cloudinary-thumbnail-progress">
                        <Upload className="w-6 h-6 text-amber-500 animate-bounce mx-auto" />
                        <p className="text-xs font-bold text-amber-400">Uploading Cover Artwork...</p>
                        <div className="w-full max-w-xs bg-slate-950 h-1.5 rounded-full overflow-hidden mx-auto border border-slate-800">
                          <div className="h-full bg-amber-500" style={{ width: `${thumbnailUploadProgress}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold">{thumbnailUploadProgress}% Complete</span>
                      </div>
                    ) : thumbnailUrl ? (
                      <div className="space-y-2">
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                          <Check className="w-3.5 h-3.5" />
                          <span>Poster Uploaded</span>
                        </span>
                        <p className="text-xs text-slate-300 font-bold truncate max-w-md mx-auto">{thumbnailUrl}</p>
                        <button
                          type="button"
                          onClick={() => thumbnailInputRef.current?.click()}
                          className="text-xs text-amber-400 hover:underline cursor-pointer"
                        >
                          Choose different artwork file
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <Upload className="w-6 h-6 text-slate-500 mx-auto" />
                        <h5 className="text-xs font-bold text-slate-300">Drag & Drop Poster Artwork File</h5>
                        <p className="text-slate-500 text-[10px]">Supports PNG, JPG, or WebP.</p>
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => thumbnailInputRef.current?.click()}
                            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-200 cursor-pointer transition-colors"
                          >
                            Browse Files
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                    />
                  </div>
                )}
              </div>

              {/* VIDEO SOURCE SELECTOR OR EPISODES COLLECTION MANAGER */}
              {contentType === 'movie' ? (
                <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-850/60 space-y-4 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Movie Stream File</label>
                      <p className="text-[10px] text-slate-500 mt-0.5">Stream the full production directly from computer file or external server.</p>
                    </div>
                    <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setVideoSourceMode('upload')}
                        className={`px-3 py-1 text-[10px] font-black rounded-md transition-colors cursor-pointer ${
                          videoSourceMode === 'upload' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => setVideoSourceMode('url')}
                        className={`px-3 py-1 text-[10px] font-black rounded-md transition-colors cursor-pointer ${
                          videoSourceMode === 'url' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Paste URL
                      </button>
                    </div>
                  </div>

                  {videoSourceMode === 'upload' ? (
                    <div className="bg-slate-900/60 border-2 border-dashed border-slate-800 rounded-xl p-5 text-center">
                      <input
                        type="file"
                        ref={videoInputRef}
                        onChange={handleVideoUpload}
                        accept="video/*"
                        className="hidden"
                      />
                      {isUploadingVideo ? (
                        <div className="space-y-3" id="cloudinary-video-progress">
                          <Upload className="w-6 h-6 text-orange-500 animate-bounce mx-auto" />
                          <p className="text-xs font-bold text-orange-400">Uploading Movie Video...</p>
                          <div className="w-full max-w-xs bg-slate-950 h-1.5 rounded-full overflow-hidden mx-auto border border-slate-800">
                            <div className="h-full bg-orange-500" style={{ width: `${videoUploadProgress}%` }} />
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold">{videoUploadProgress}% Complete</span>
                        </div>
                      ) : videoUrl && videoUrl !== 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' ? (
                        <div className="space-y-2">
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                            <Check className="w-3.5 h-3.5" />
                            <span>Video Uploaded</span>
                          </span>
                          <p className="text-xs text-slate-300 font-bold truncate max-w-md mx-auto">{videoUrl}</p>
                          <button
                            type="button"
                            onClick={() => videoInputRef.current?.click()}
                            className="text-xs text-orange-400 hover:underline cursor-pointer"
                          >
                            Choose different video file
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <Upload className="w-6 h-6 text-slate-500 mx-auto" />
                          <h5 className="text-xs font-bold text-slate-300">Drag & Drop Production Video File</h5>
                          <p className="text-slate-500 text-[10px]">Supports MP4, WebM, or MKV.</p>
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => videoInputRef.current?.click()}
                              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-200 cursor-pointer transition-colors"
                            >
                              Browse Files
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                      />
                    </div>
                  )}
                </div>
              ) : (
                /* EPISODES COLLECTION MANAGER FOR SERIES */
                <div className="space-y-4 bg-slate-900/30 p-5 rounded-2xl border border-slate-850/80 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                        <Tv className="w-4 h-4 text-amber-500" />
                        <span>TV Show Episodes Collection</span>
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Manage and populate episode records all at once.</p>
                    </div>

                    <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setEpisodeSourceMode('upload')}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                          episodeSourceMode === 'upload' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Bulk Upload Local
                      </button>
                      <button
                        type="button"
                        onClick={() => setEpisodeSourceMode('url')}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                          episodeSourceMode === 'url' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Bulk URLs List
                      </button>
                    </div>
                  </div>

                  {episodeSourceMode === 'upload' ? (
                    <div className="bg-slate-900/60 border-2 border-dashed border-slate-800 rounded-xl p-5 text-center">
                      <input
                        type="file"
                        ref={episodesInputRef}
                        onChange={handleBulkEpisodesUpload}
                        accept="video/*"
                        multiple
                        className="hidden"
                      />

                      {isUploadingEpisodes ? (
                        <div className="space-y-3">
                          <Upload className="w-6 h-6 text-amber-500 animate-bounce mx-auto" />
                          <p className="text-xs font-bold text-amber-400">
                            Uploading Episode {currentUploadingIndex} of {totalUploadingCount}...
                          </p>
                          <div className="w-full max-w-xs bg-slate-950 h-1.5 rounded-full overflow-hidden mx-auto border border-slate-800">
                            <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${episodesUploadProgress}%` }} />
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold">{episodesUploadProgress}% Complete</span>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <Upload className="w-6 h-6 text-slate-500 mx-auto" />
                          <h5 className="text-xs font-bold text-slate-300">Choose Multiple Episode Video Files</h5>
                          <p className="text-slate-500 text-[10px]">Select video files all at once. Episode metadata will auto-generate from file tags.</p>
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => episodesInputRef.current?.click()}
                              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-200 cursor-pointer transition-colors"
                            >
                              Browse Episode Videos
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Paste Direct Episode Stream URLs (One Link per line)</label>
                        <textarea
                          rows={4}
                          value={bulkEpisodeUrls}
                          onChange={(e) => setBulkEpisodeUrls(e.target.value)}
                          placeholder="https://example.com/stream/episode1.mp4&#10;https://example.com/stream/episode2.mp4"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleBulkEpisodeUrlsAdd}
                        className="w-full py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-200 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 border border-slate-800 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-amber-500" />
                        <span>Bulk Register Episodes List</span>
                      </button>
                    </div>
                  )}

                  {/* Episodes List Editor */}
                  {episodes.length > 0 && (
                    <div className="space-y-3 pt-3 border-t border-slate-850">
                      <div className="flex justify-between items-center">
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Episodes Collection list ({episodes.length})</h5>
                        <button
                          type="button"
                          onClick={() => {
                            const epNum = episodes.length + 1;
                            setEpisodes([...episodes, {
                              id: `ep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                              episodeNumber: epNum,
                              seasonNumber: 1,
                              title: `Episode ${epNum}`,
                              duration: '45m',
                              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
                            }]);
                          }}
                          className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Episode Manually</span>
                        </button>
                      </div>
                      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                        {episodes.map((ep, idx) => (
                          <div key={ep.id} className="bg-slate-950 border border-slate-850 rounded-xl p-3 space-y-3 md:space-y-0 md:flex md:items-center md:gap-3">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 bg-slate-900 border border-slate-800 text-amber-500 text-xs font-bold rounded-full flex items-center justify-center">
                                {ep.episodeNumber}
                              </span>
                              <span className="text-[10px] uppercase font-bold text-slate-500 min-w-[50px]">S1:E{ep.episodeNumber}</span>
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Episode Title</span>
                                <input
                                  type="text"
                                  value={ep.title}
                                  onChange={(e) => handleUpdateEpisodeField(ep.id, 'title', e.target.value)}
                                  placeholder="e.g. Episode Title"
                                  className="bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 w-full focus:outline-none"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Duration</span>
                                  <input
                                    type="text"
                                    value={ep.duration}
                                    onChange={(e) => handleUpdateEpisodeField(ep.id, 'duration', e.target.value)}
                                    placeholder="e.g. 45m"
                                    className="bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 w-full focus:outline-none text-center"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Stream Link</span>
                                  <input
                                    type="text"
                                    value={ep.videoUrl}
                                    onChange={(e) => handleUpdateEpisodeField(ep.id, 'videoUrl', e.target.value)}
                                    placeholder="Video Link"
                                    className="bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-lg px-2.5 py-1.5 text-[10px] font-mono text-slate-300 w-full focus:outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-2 md:pt-0">
                              <button
                                type="button"
                                onClick={() => handleDeleteEpisode(ep.id)}
                                className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                title="Remove episode"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                id="admin-submit-movie-btn"
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl shadow-lg shadow-orange-950/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer text-sm flex items-center justify-center gap-2"
              >
                {contentType === 'movie' ? (
                  <>
                    <Film className="w-4 h-4" />
                    <span>Publish Movie & Register Stream</span>
                  </>
                ) : (
                  <>
                    <Tv className="w-4 h-4" />
                    <span>Publish TV Show Series Collection ({episodes.length} Episodes)</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {adminTab === 'movies-list' && (
          <div id="movies-list-panel" className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black font-sans tracking-tight">Manage Catalog</h3>
                <p className="text-slate-400 text-xs mt-1">Review active cinematic library, customize views, or delete publications.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="toggle-view-grid"
                  onClick={() => setAdminViewMode('grid')}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    adminViewMode === 'grid' 
                      ? 'bg-amber-500 border-amber-500 text-slate-950' 
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  id="toggle-view-list"
                  onClick={() => setAdminViewMode('list')}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    adminViewMode === 'list' 
                      ? 'bg-amber-500 border-amber-500 text-slate-950' 
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-3 bg-slate-900/60 p-4 border border-slate-850 rounded-2xl">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Filter Genre</label>
                <select
                  id="admin-filter-genre"
                  value={adminGenreFilter}
                  onChange={(e) => setAdminGenreFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg text-xs px-3 py-1.5 focus:outline-none text-slate-200"
                >
                  {GENRES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Filter Year</label>
                <select
                  id="admin-filter-year"
                  value={adminYearFilter}
                  onChange={(e) => setAdminYearFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg text-xs px-3 py-1.5 focus:outline-none text-slate-200"
                >
                  <option value="All">All Years</option>
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>
            </div>

            {/* Content Rendering based on mode */}
            {movies.filter(m => {
              const genreMatch = adminGenreFilter === 'All' || m.genre === adminGenreFilter;
              const yearMatch = adminYearFilter === 'All' || m.releaseYear.toString() === adminYearFilter;
              return genreMatch && yearMatch;
            }).length === 0 ? (
              <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-850">
                <p className="text-slate-400 text-sm">No movies match your active filter settings.</p>
              </div>
            ) : adminViewMode === 'grid' ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" id="admin-movies-grid">
                {movies
                  .filter(m => {
                    const genreMatch = adminGenreFilter === 'All' || m.genre === adminGenreFilter;
                    const yearMatch = adminYearFilter === 'All' || m.releaseYear.toString() === adminYearFilter;
                    return genreMatch && yearMatch;
                  })
                  .map((movie) => (
                    <div key={movie.id} className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-md relative group">
                      <img
                        src={movie.thumbnailUrl}
                        alt={movie.title}
                        referrerPolicy="no-referrer"
                        className="w-full aspect-[16/10] object-cover opacity-80"
                      />
                      <div className="p-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800 text-amber-400 rounded">
                          {movie.genre}
                        </span>
                        <h4 className="font-bold text-white mt-2 truncate text-sm">{movie.title}</h4>
                        <p className="text-slate-400 text-xs mt-1">{movie.releaseYear} • {movie.duration}</p>
                        
                        <div className="mt-4 pt-4 border-t border-slate-850 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500">
                            ★ {movie.rating}
                          </span>
                          <button
                            id={`admin-delete-movie-${movie.id}`}
                            onClick={() => {
                              onDeleteMovie(movie.id);
                              addToast(`Successfully removed "${movie.title}"`, 'info');
                            }}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg cursor-pointer transition-colors"
                            title="Delete Publication"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden" id="admin-movies-list">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950 text-xs font-bold text-slate-400 uppercase border-b border-slate-850">
                    <tr>
                      <th className="px-6 py-4">Movie</th>
                      <th className="px-6 py-4">Genre</th>
                      <th className="px-6 py-4">Year</th>
                      <th className="px-6 py-4">Rating</th>
                      <th className="px-6 py-4">Views</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {movies
                      .filter(m => {
                        const genreMatch = adminGenreFilter === 'All' || m.genre === adminGenreFilter;
                        const yearMatch = adminYearFilter === 'All' || m.releaseYear.toString() === adminYearFilter;
                        return genreMatch && yearMatch;
                      })
                      .map((movie) => (
                        <tr key={movie.id} className="hover:bg-slate-850/30 transition-colors">
                          <td className="px-6 py-4 flex items-center gap-3">
                            <img
                              src={movie.thumbnailUrl}
                              alt={movie.title}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <span className="font-semibold text-white truncate max-w-[180px]">{movie.title}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-800 text-amber-400 rounded">
                              {movie.genre}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-400">{movie.releaseYear}</td>
                          <td className="px-6 py-4 text-slate-400">{movie.rating}</td>
                          <td className="px-6 py-4 text-slate-400">{movie.views.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              id={`admin-delete-movie-row-${movie.id}`}
                              onClick={() => {
                                onDeleteMovie(movie.id);
                                addToast(`Successfully removed "${movie.title}"`, 'info');
                              }}
                              className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl cursor-pointer transition-colors"
                              title="Delete Publication"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {adminTab === 'users' && (
          <div id="users-panel" className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-2xl font-black font-sans tracking-tight">Subscribers & Accounts</h3>
              <p className="text-slate-400 text-xs mt-1">Review active users, modify subscription status, and inspect custom watchlists.</p>
            </div>

            <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden" id="admin-users-list">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-xs font-bold text-slate-400 uppercase border-b border-slate-850">
                  <tr>
                    <th className="px-6 py-4">Username</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Subscription Status</th>
                    <th className="px-6 py-4">Watchlist Size</th>
                    <th className="px-6 py-4 text-right">Set VIP Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {users.map((u) => {
                    const isSub = u.subscription?.active;
                    return (
                      <tr key={u.id} className="hover:bg-slate-850/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-white">{u.username}</td>
                        <td className="px-6 py-4 text-slate-400">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isSub 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-slate-800 text-slate-400 border border-slate-750'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isSub ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                            {isSub ? `${u.subscription.planId?.toUpperCase() || 'VIP'} Member` : 'Free Tier'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400">{u.watchlist?.length || 0} items</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            id={`toggle-user-sub-${u.id}`}
                            onClick={() => {
                              onUpdateUserSubscription(u.id, !isSub, isSub ? undefined : 'gold');
                              addToast(`Updated subscription for ${u.username}`, 'success');
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isSub
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                            }`}
                          >
                            {isSub ? 'Revoke VIP' : 'Grant VIP Gold'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
