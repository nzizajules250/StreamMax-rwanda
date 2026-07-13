import { useEffect, useState } from 'react';
import {
  Sparkles,
  Film,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  Search,
  Home,
  Clapperboard,
} from 'lucide-react';
import { User, ActiveTab } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: User | null;
  onLogout: () => void;
  onOpenSubscription: () => void;
  mediaTypeFilter: 'all' | 'movie' | 'series' | 'upcoming';
  setMediaTypeFilter: (filter: 'all' | 'movie' | 'series' | 'upcoming') => void;
  setGenreFilter?: (g: string) => void;
}

function Sprockets({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`h-[3px] w-full opacity-50 ${className}`}
      style={{
        backgroundImage:
          'radial-gradient(circle, rgba(0,230,0,0.3) 1.4px, transparent 1.6px)',
        backgroundSize: '11px 3px',
        backgroundRepeat: 'repeat-x',
        backgroundPosition: 'center',
      }}
    />
  );
}

const NAV_ITEMS: { id: ActiveTab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'movies', label: 'Browse', icon: Clapperboard },
  { id: 'search', label: 'Search', icon: Search },
];

export default function Navbar({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  onOpenSubscription,
  mediaTypeFilter,
  setMediaTypeFilter,
  setGenreFilter,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [activeTab]);

  const goTo = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'home') {
      setMediaTypeFilter('all');
    }
  };

  const selectMediaType = (filter: 'all' | 'movie' | 'series' | 'upcoming') => {
    setMediaTypeFilter(filter);
    if (setGenreFilter) {
      setGenreFilter('All');
    }
    setActiveTab('movies');
  };

  const isHome = activeTab === 'home';

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-[#070101]/95 backdrop-blur-md border-b border-[#1b0303] shadow-[0_8px_30px_-12px_rgba(0,0,0,0.9)]'
          : isHome
          ? 'bg-transparent'
          : 'bg-[#070101]'
      }`}
    >
      <style>{`
        @keyframes vipShimmer {
          0% { transform: translateX(-120%) skewX(-15deg); }
          100% { transform: translateX(220%) skewX(-15deg); }
        }
        .vip-shimmer::after {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 40%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent);
          animation: vipShimmer 2.8s ease-in-out infinite;
        }
      `}</style>

      <div
        className={`mx-auto w-full max-w-7xl flex items-center justify-between px-4 md:px-10 transition-all duration-300 ${
          scrolled ? 'py-3.5' : 'py-5.5'
        }`}
      >
        {/* ---------------- Brand Logo (CineLand) ---------------- */}
        <div
          onClick={() => goTo('home')}
          className="flex items-center gap-2 cursor-pointer select-none group shrink-0"
        >
          <h1 className="text-3xl font-black tracking-tight text-[#00E600] flex items-center gap-0 drop-shadow-[0_0_8px_rgba(0,230,0,0.3)]">
            <span>CineLand</span>
          </h1>
        </div>

        {/* ---------------- Center Navigation ---------------- */}
        {isHome ? (
          /* Landing page design: Tv Shows, Movies, Upcoming text links */
          <nav className="hidden md:flex items-center gap-9">
            <button
              onClick={() => selectMediaType('series')}
              className="text-[15px] font-medium text-slate-200 hover:text-[#00E600] tracking-wide transition-all uppercase cursor-pointer"
            >
              Tv Shows
            </button>
            <button
              onClick={() => selectMediaType('movie')}
              className="text-[15px] font-medium text-slate-200 hover:text-[#00E600] tracking-wide transition-all uppercase cursor-pointer"
            >
              Movies
            </button>
            <button
              onClick={() => selectMediaType('upcoming')}
              className="text-[15px] font-medium text-slate-200 hover:text-[#00E600] tracking-wide transition-all uppercase cursor-pointer"
            >
              Upcoming
            </button>
          </nav>
        ) : (
          /* Other pages: Floating filmstrip capsule style but burgundy/neon green themed */
          <nav className="hidden md:flex flex-col items-center">
            <Sprockets className="rounded-t-full" />
            <div className="flex items-center gap-1 bg-[#110202] px-3 py-1.5 border-x border-[#1b0303] shadow-inner">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
                const active = activeTab === id;
                return (
                  <button
                    key={id}
                    id={`floating-nav-${id}`}
                    onClick={() => goTo(id)}
                    className={`relative px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                      active ? 'text-slate-950 font-black' : 'text-slate-400 hover:text-[#00E600]'
                    }`}
                  >
                    {active && (
                      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00E600] to-[#00ff88] shadow-[0_0_12px_rgba(0,230,0,0.4)]" />
                    )}
                    <Icon className="relative w-3.5 h-3.5" />
                    <span className="relative">{label}</span>
                  </button>
                );
              })}
              <button
                id="floating-nav-profile"
                onClick={() => goTo(currentUser ? 'profile' : 'auth')}
                className={`relative px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'profile' ? 'text-slate-950 font-black' : 'text-slate-400 hover:text-[#00E600]'
                }`}
              >
                {activeTab === 'profile' && (
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00E600] to-[#00ff88] shadow-[0_0_12px_rgba(0,230,0,0.4)]" />
                )}
                <span className="relative">My Cinema</span>
              </button>
            </div>
            <Sprockets className="rounded-b-full" />
          </nav>
        )}

        {/* ---------------- Right Controls ---------------- */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          {/* Custom Search Icon enclosed in a circular green ring as shown in the image */}
          <button
            onClick={() => goTo('search')}
            className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer ${
              activeTab === 'search'
                ? 'border-[#00E600] text-[#00E600] bg-[#00E600]/10'
                : 'border-[#00E600]/50 hover:border-[#00E600] text-[#00E600] hover:bg-[#00E600]/5'
            }`}
            title="Search movies"
          >
            <Search className="w-4 h-4 text-[#00E600]" />
          </button>

          {currentUser ? (
            <>
              {currentUser.role === 'admin' && (
                <button
                  id="navbar-admin-trigger"
                  onClick={() => goTo('admin')}
                  className={`px-3.5 py-1.5 text-xs font-black rounded-lg border flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === 'admin'
                      ? 'bg-red-500/20 border-red-500/50 text-red-400'
                      : 'bg-red-950/20 border-red-900/35 text-red-500 hover:bg-red-900/10'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
              )}

              <button
                id="navbar-subscription-badge"
                onClick={onOpenSubscription}
                className={`relative overflow-hidden px-3.5 py-1.5 text-xs font-black rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                  currentUser.subscription?.active
                    ? 'bg-emerald-500/15 border border-emerald-500/25 text-emerald-400'
                    : 'vip-shimmer bg-gradient-to-r from-[#00E600] to-[#00cc00] text-slate-950 shadow-[0_0_12px_rgba(0,230,0,0.3)]'
                }`}
              >
                {currentUser.subscription?.active ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                )}
                <span>{currentUser.subscription?.active ? 'VIP ACTIVE' : 'GO VIP'}</span>
              </button>

              <button
                id="navbar-profile-trigger"
                onClick={() => goTo('profile')}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black cursor-pointer transition-all border-2 ${
                  activeTab === 'profile'
                    ? 'border-[#00E600] text-[#00E600] bg-[#00E600]/10'
                    : 'border-white/10 text-slate-100 bg-[#110202] hover:border-[#00E600]/45'
                }`}
                title={currentUser.username}
              >
                {currentUser.username.slice(0, 1).toUpperCase()}
              </button>

              <button
                id="navbar-logout-btn"
                onClick={onLogout}
                className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-500/10 cursor-pointer transition-all"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              id="navbar-login-btn"
              onClick={() => goTo('auth')}
              className="px-5 py-2.5 bg-gradient-to-r from-[#00E600] to-[#00b000] text-slate-950 text-xs font-black uppercase tracking-wider rounded-lg cursor-pointer hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_14px_rgba(0,230,0,0.25)]"
            >
              Sign In
            </button>
          )}
        </div>

        {/* ---------------- Mobile toggle ---------------- */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => goTo('search')}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-[#00E600]/40 text-[#00E600]"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#1b0303] text-slate-200 cursor-pointer"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ---------------- Mobile panel ---------------- */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? 'max-h-[450px]' : 'max-h-0'
        }`}
      >
        <Sprockets />
        <div className="px-4 py-4 bg-[#110202] flex flex-col gap-1.5">
          {isHome ? (
            <>
              <button
                onClick={() => selectMediaType('series')}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-bold text-slate-200 hover:bg-white/[0.03]"
              >
                Tv Shows
              </button>
              <button
                onClick={() => selectMediaType('movie')}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-bold text-slate-200 hover:bg-white/[0.03]"
              >
                Movies
              </button>
              <button
                onClick={() => selectMediaType('upcoming')}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-bold text-slate-200 hover:bg-white/[0.03]"
              >
                Upcoming
              </button>
            </>
          ) : (
            NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => goTo(id)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-bold cursor-pointer transition-all ${
                  activeTab === id
                    ? 'bg-[#00E600]/15 text-[#00E600]'
                    : 'text-slate-400 hover:bg-white/[0.03]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))
          )}

          <button
            onClick={() => goTo(currentUser ? 'profile' : 'auth')}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-bold cursor-pointer transition-all ${
              activeTab === 'profile'
                ? 'bg-[#00E600]/15 text-[#00E600]'
                : 'text-slate-400 hover:bg-white/[0.03]'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-current opacity-30" />
            My Cinema
          </button>

          <div className="h-px bg-[#1b0303] my-2" />

          {currentUser ? (
            <>
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => goTo('admin')}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-bold text-red-400 hover:bg-red-500/10 cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4" />
                  Admin Dashboard
                </button>
              )}
              <button
                onClick={onOpenSubscription}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-bold cursor-pointer ${
                  currentUser.subscription?.active
                    ? 'text-emerald-400 hover:bg-emerald-500/10'
                    : 'text-[#00E600] hover:bg-[#00E600]/10'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                {currentUser.subscription?.active ? 'VIP Active' : 'Go VIP'}
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-bold text-slate-400 hover:bg-white/[0.03] cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Log Out ({currentUser.username})
              </button>
            </>
          ) : (
            <button
              onClick={() => goTo('auth')}
              className="mt-1 px-3 py-3 bg-gradient-to-r from-[#00E600] to-[#00b000] text-slate-950 text-sm font-black uppercase rounded-lg text-center cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
