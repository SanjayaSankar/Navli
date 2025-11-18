
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import PreferencesForm from './components/PreferencesForm';
import SuggestionList from './components/SuggestionList';
import ItineraryView from './components/ItineraryView';
import LoadingScreen from './components/LoadingScreen';
import MyTrips from './components/MyTrips';
import Saved from './components/Saved';
import Explore from './components/Explore';
import Profile from './components/Profile';
import Settings from './components/Settings';
import { UserPreferences, Destination, Itinerary, AppView } from './types';
import { getDestinationSuggestions, getItinerary } from './services/geminiService';
import { supabase } from './lib/supabaseClient';
import { LogIn } from 'lucide-react';

enum FlowStep {
  Preferences,
  Suggestions,
  Itinerary
}

const App: React.FC = () => {
  // Main App Navigation State
  const [currentView, setCurrentView] = useState<AppView>(AppView.Home);
  
  // Home Flow State (Preferences -> Suggestions -> Itinerary)
  const [homeStep, setHomeStep] = useState<FlowStep>(FlowStep.Preferences);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [suggestions, setSuggestions] = useState<Destination[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  
  // Auth State
  const [session, setSession] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'signin'|'signup'>('signin');
  const [authError, setAuthError] = useState<string|null>(null);

  // Spotlight effect logic
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    
    // Auth check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      subscription.unsubscribe();
    };
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    let error;

    if (authMode === 'signup') {
      console.log('🔐 Starting signup process...');
      const res = await supabase.auth.signUp({ email, password });
      error = res.error;

      console.log('📧 Signup response:', res);

      if(!error) {
          // Create profile entry
          if (res.data.user) {
             console.log('👤 Creating profile for user:', res.data.user.id);
             const profileRes = await supabase.from('profiles').insert([{
               id: res.data.user.id,
               email: res.data.user.email
             }]);

             console.log('📝 Profile creation response:', profileRes);

             if (profileRes.error) {
               console.error('❌ Profile creation failed:', profileRes.error);
               setAuthError('Account created but profile setup failed: ' + profileRes.error.message);
             } else {
               console.log('✅ Profile created successfully!');
               alert("Check your email for confirmation!");
               setShowAuthModal(false);
             }
          }
      }
    } else {
      console.log('🔐 Starting signin process...');
      const res = await supabase.auth.signInWithPassword({ email, password });
      error = res.error;
      console.log('📧 Signin response:', res);
      if (!error) setShowAuthModal(false);
    }

    if (error) {
      console.error('❌ Auth error:', error);
      setAuthError(error.message);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setCurrentView(AppView.Home);
  };

  const handlePreferencesSubmit = useCallback(async (prefs: UserPreferences) => {
    setLoading(true);
    setError(null);
    setPreferences(prefs);
    
    try {
      const results = await getDestinationSuggestions(prefs);
      setSuggestions(results);
      setHomeStep(FlowStep.Suggestions);
    } catch (err: any) {
      setError(err.message || "Failed to load suggestions. Please check your API key and try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDestinationSelect = useCallback(async (dest: Destination) => {
    if (!preferences) return;
    
    setLoading(true);
    setError(null);
    setSelectedDestination(dest);
    
    try {
      const result = await getItinerary(dest, preferences);
      setItinerary(result);
      setHomeStep(FlowStep.Itinerary);
    } catch (err: any) {
      setError(err.message || "Failed to generate itinerary. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [preferences]);

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
  };

  const renderContent = () => {
    if (loading && !showAuthModal) {
       return (
         <LoadingScreen 
            message={
              homeStep === FlowStep.Preferences 
                ? "Analyzing global data & curating trips..." 
                : `Crafting your luxury experience for ${selectedDestination?.name}...`
            } 
          />
       );
    }

    switch (currentView) {
      case AppView.MyTrips:
        return <MyTrips />;
      case AppView.Saved:
        return <Saved />;
      case AppView.Explore:
        return <Explore />;
      case AppView.Profile:
        return <Profile />;
      case AppView.Settings:
        return <Settings />;
      case AppView.Home:
      default:
        if (homeStep === FlowStep.Preferences) {
          return (
            <div className="py-8 max-w-4xl mx-auto">
              <div className="text-center mb-12 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-white/50 mb-4">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  AI Powered Travel Engine
                </div>
                <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white drop-shadow-2xl">
                  <span className="block">Design Your</span>
                  <span className="shimmer-text">Next Journey</span>
                </h1>
                <p className="text-xl text-white/40 max-w-xl mx-auto font-light leading-relaxed">
                  Navli creates hyper-personalized itineraries, finds real-time flight deals, and organizes your perfect trip in seconds.
                </p>
              </div>
              <PreferencesForm onSubmit={handlePreferencesSubmit} isLoading={loading} />
            </div>
          );
        }
        if (homeStep === FlowStep.Suggestions) {
          return (
            <SuggestionList 
              suggestions={suggestions} 
              onSelect={handleDestinationSelect}
              onBack={() => setHomeStep(FlowStep.Preferences)}
            />
          );
        }
        if (homeStep === FlowStep.Itinerary && itinerary) {
          return (
            <ItineraryView
              itinerary={itinerary}
              onBack={() => setHomeStep(FlowStep.Suggestions)}
              startDate={preferences?.startDate}
              endDate={preferences?.endDate}
            />
          );
        }
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-100">
      {/* Spotlight Overlay */}
      <div 
        className="spotlight-overlay"
        style={{ '--x': `${mousePos.x}px`, '--y': `${mousePos.y}px` } as React.CSSProperties}
      />

      <Header toggleSidebar={() => setIsSidebarOpen(true)} />
      
      {!session && (
          <div className="fixed top-4 right-20 z-50">
              <button onClick={() => setShowAuthModal(true)} className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors">
                  Sign In
              </button>
          </div>
      )}
      
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentView={currentView}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <main className="flex-grow container mx-auto px-4 py-20 sm:px-6 lg:px-8 relative z-10">
        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-500/10 border border-red-500/20 text-red-200 px-6 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in backdrop-blur-md shadow-lg shadow-red-900/20">
            <span>⚠️ {error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-sm font-bold hover:text-white transition-colors"
            >
              DISMISS
            </button>
          </div>
        )}

        {renderContent()}

      </main>

      {/* Simple Auth Modal */}
      {showAuthModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
              <div className="bg-[#050505] border border-white/10 rounded-2xl p-8 max-w-md w-full relative">
                  <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-white/40 hover:text-white">✕</button>
                  <h2 className="text-2xl font-bold text-white mb-6">{authMode === 'signin' ? 'Welcome Back' : 'Join Navli'}</h2>
                  
                  {authError && <div className="bg-red-500/20 text-red-200 text-sm p-3 rounded-lg mb-4">{authError}</div>}
                  
                  <form onSubmit={handleAuth} className="space-y-4">
                      <div>
                          <label className="block text-xs uppercase text-white/40 mb-1">Email</label>
                          <input 
                              type="email" 
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none"
                              required
                          />
                      </div>
                      <div>
                          <label className="block text-xs uppercase text-white/40 mb-1">Password</label>
                          <input 
                              type="password" 
                              value={password}
                              onChange={e => setPassword(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none"
                              required
                          />
                      </div>
                      <button type="submit" disabled={loading} className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors">
                          {loading ? 'Processing...' : (authMode === 'signin' ? 'Sign In' : 'Create Account')}
                      </button>
                  </form>
                  
                  <div className="mt-6 text-center text-sm text-white/40">
                      {authMode === 'signin' ? "Don't have an account?" : "Already have an account?"}
                      <button 
                          onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                          className="text-white ml-2 underline hover:text-red-400"
                      >
                          {authMode === 'signin' ? "Sign Up" : "Log In"}
                      </button>
                  </div>
              </div>
          </div>
      )}

      <footer className="py-8 mt-auto relative z-10">
        <div className="container mx-auto px-4 text-center text-white/20 text-sm font-medium">
          <p>© {new Date().getFullYear()} Navli. Intelligent Travel Solutions.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
