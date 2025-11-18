import React, { useState, useEffect } from 'react';
import { TravelStyle, BudgetLevel, Interest, UserPreferences, TravelScope } from '../types';
import { Users, Wallet, MapPin, Heart, ArrowRight, Globe, IndianRupee, Baby, User } from 'lucide-react';

interface PreferencesFormProps {
  onSubmit: (prefs: UserPreferences) => void;
  isLoading: boolean;
}

const PreferencesForm: React.FC<PreferencesFormProps> = ({ onSubmit, isLoading }) => {
  const [step, setStep] = useState(1);
  const [prefs, setPrefs] = useState<UserPreferences>({
    travelStyle: TravelStyle.Solo,
    travelers: { adults: 1, children: 0 },
    budget: BudgetLevel.Moderate,
    interests: [],
    originCity: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    travelScope: TravelScope.International
  });

  // Auto-update counts based on style
  useEffect(() => {
    if (prefs.travelStyle === TravelStyle.Solo) {
      setPrefs(p => ({ ...p, travelers: { adults: 1, children: 0 } }));
    } else if (prefs.travelStyle === TravelStyle.Couple) {
      setPrefs(p => ({ ...p, travelers: { adults: 2, children: 0 } }));
    }
  }, [prefs.travelStyle]);

  const handleInterestToggle = (interest: Interest) => {
    setPrefs(prev => {
      const current = prev.interests;
      if (current.includes(interest)) {
        return { ...prev, interests: current.filter(i => i !== interest) };
      } else {
        if (current.length >= 3) return prev; 
        return { ...prev, interests: [...current, interest] };
      }
    });
  };

  const renderStep1 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Let's start with the basics</h2>
        <p className="text-white/40">Where is your next adventure calling you?</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setPrefs({ ...prefs, travelScope: TravelScope.Domestic })}
          className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-3 group ${
            prefs.travelScope === TravelScope.Domestic
              ? 'border-red-500 bg-red-500/10 text-white shadow-[0_0_30px_rgba(239,68,68,0.2)]'
              : 'border-white/5 bg-white/5 text-white/40 hover:bg-white/10 hover:border-white/10'
          }`}
        >
          <div className={`p-3 rounded-full ${prefs.travelScope === TravelScope.Domestic ? 'bg-red-500 text-white' : 'bg-white/10'}`}>
             <IndianRupee className="w-6 h-6" />
          </div>
          <span className="font-medium">Within India</span>
        </button>
        <button
          onClick={() => setPrefs({ ...prefs, travelScope: TravelScope.International })}
          className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-3 group ${
            prefs.travelScope === TravelScope.International
              ? 'border-purple-500 bg-purple-500/10 text-white shadow-[0_0_30px_rgba(168,85,247,0.2)]'
              : 'border-white/5 bg-white/5 text-white/40 hover:bg-white/10 hover:border-white/10'
          }`}
        >
          <div className={`p-3 rounded-full ${prefs.travelScope === TravelScope.International ? 'bg-purple-500 text-white' : 'bg-white/10'}`}>
             <Globe className="w-6 h-6" />
          </div>
          <span className="font-medium">International</span>
        </button>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-white/60 ml-1">Who is traveling?</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.values(TravelStyle).map((style) => (
            <button
              key={style}
              onClick={() => setPrefs({ ...prefs, travelStyle: style })}
              className={`py-3 px-4 rounded-xl border text-sm transition-all flex items-center justify-center gap-2 ${
                prefs.travelStyle === style
                  ? 'border-red-400 bg-red-500/20 text-white font-semibold'
                  : 'border-white/5 bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Traveler Counts */}
      {(prefs.travelStyle === TravelStyle.Family || prefs.travelStyle === TravelStyle.Group) && (
        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white/5 border border-white/5 animate-in fade-in zoom-in-95">
          <div>
            <label className="text-xs text-white/40 mb-2 block">Adults (12+)</label>
            <div className="flex items-center gap-3 bg-black/20 rounded-lg p-2 border border-white/5">
              <User className="w-4 h-4 text-white/60" />
              <input 
                type="number" 
                min="1" 
                max="20"
                value={prefs.travelers.adults}
                onChange={(e) => setPrefs({...prefs, travelers: {...prefs.travelers, adults: parseInt(e.target.value) || 1}})}
                className="bg-transparent w-full outline-none text-white text-center font-mono"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-white/40 mb-2 block">Children</label>
            <div className="flex items-center gap-3 bg-black/20 rounded-lg p-2 border border-white/5">
              <Baby className="w-4 h-4 text-white/60" />
              <input 
                type="number" 
                min="0" 
                max="10"
                value={prefs.travelers.children}
                onChange={(e) => setPrefs({...prefs, travelers: {...prefs.travelers, children: parseInt(e.target.value) || 0}})}
                className="bg-transparent w-full outline-none text-white text-center font-mono"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button
          onClick={() => setStep(s => s + 1)}
          className="group relative px-8 py-4 bg-white text-black rounded-full font-bold overflow-hidden transition-transform active:scale-95 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
        >
          <span className="relative z-10 flex items-center gap-2">Next Step <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Logistics</h2>
        <p className="text-white/40">When and where are you starting?</p>
      </div>

      <div className="space-y-6">
        <div className="relative group">
          <label className="text-sm font-medium text-white/60 mb-2 block">Departing From</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5 group-focus-within:text-red-400 transition-colors" />
            <input
              type="text"
              placeholder="e.g. Mumbai, Delhi, New York"
              value={prefs.originCity}
              onChange={(e) => setPrefs({ ...prefs, originCity: e.target.value })}
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-white/40">Start Date</label>
            <input
              type="date"
              value={prefs.startDate}
              onChange={(e) => setPrefs({ ...prefs, startDate: e.target.value })}
              className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-purple-500/50 outline-none [color-scheme:dark]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-white/40">End Date</label>
            <input
              type="date"
              value={prefs.endDate}
              min={prefs.startDate}
              onChange={(e) => setPrefs({ ...prefs, endDate: e.target.value })}
              className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-purple-500/50 outline-none [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-white/60">Approximate Budget</label>
        <div className="grid grid-cols-4 gap-2">
          {Object.values(BudgetLevel).map((level) => (
            <button
              key={level}
              onClick={() => setPrefs({ ...prefs, budget: level })}
              className={`p-3 text-xs rounded-xl border transition-all flex flex-col items-center justify-center gap-2 h-24 ${
                prefs.budget === level
                  ? 'border-purple-500 bg-purple-500/20 text-white'
                  : 'border-white/5 bg-white/5 text-white/30 hover:bg-white/10'
              }`}
            >
              <Wallet className={`w-5 h-5 ${prefs.budget === level ? 'text-purple-400' : 'text-white/20'}`} />
              <span className="text-center leading-tight">{level}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={() => setStep(s => s - 1)} className="text-white/40 hover:text-white font-medium px-4">Back</button>
        <button
          onClick={() => setStep(s => s + 1)}
          disabled={!prefs.originCity}
          className="group relative px-8 py-4 bg-white text-black rounded-full font-bold overflow-hidden transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="relative z-10 flex items-center gap-2">Next <ArrowRight className="w-4 h-4" /></span>
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Vibes</h2>
        <p className="text-white/40">Pick up to 3 vibes that match your mood.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Object.values(Interest).map((interest) => {
          const isSelected = prefs.interests.includes(interest);
          return (
            <button
              key={interest}
              onClick={() => handleInterestToggle(interest)}
              className={`p-4 rounded-2xl border text-sm font-medium transition-all h-28 flex flex-col items-center justify-center gap-3 text-center relative overflow-hidden group ${
                isSelected
                  ? 'border-red-500 bg-gradient-to-br from-red-500/20 to-purple-600/20 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]'
                  : 'border-white/5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/80'
              }`}
            >
              {isSelected && <div className="absolute inset-0 bg-gradient-to-tr from-red-500/10 to-purple-500/10 animate-pulse"></div>}
              <Heart className={`w-6 h-6 relative z-10 transition-transform duration-300 ${isSelected ? 'fill-red-500 text-red-500 scale-110' : 'group-hover:scale-110'}`} />
              <span className="relative z-10">{interest}</span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between pt-6 border-t border-white/5">
        <button onClick={() => setStep(s => s - 1)} className="text-white/40 hover:text-white font-medium px-4">Back</button>
        <button
          onClick={() => onSubmit(prefs)}
          disabled={prefs.interests.length === 0 || isLoading}
          className="group relative px-10 py-4 bg-gradient-to-r from-red-500 to-purple-600 rounded-full font-bold text-white shadow-lg shadow-red-900/40 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
          {isLoading ? (
            <span className="flex items-center gap-2"><span className="animate-spin">⏳</span> Curating...</span>
          ) : (
             <span className="flex items-center gap-2">Generate Itinerary <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-3xl mx-auto glass-panel rounded-[2rem] p-6 md:p-12 relative">
      {/* Progress Indicator */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
        <div 
          className="h-full bg-gradient-to-r from-red-500 to-purple-600 transition-all duration-500"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>
      
      <div className="relative z-10 mt-4">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
};

export default PreferencesForm;