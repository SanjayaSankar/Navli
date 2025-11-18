import React, { useState } from 'react';
import { Destination } from '../types';
import { MapPin, Star, ArrowRight, IndianRupee, Plane, Heart } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface SuggestionListProps {
  suggestions: Destination[];
  onSelect: (dest: Destination) => void;
  onBack: () => void;
}

const SuggestionList: React.FC<SuggestionListProps> = ({ suggestions, onSelect, onBack }) => {
  const [savedStates, setSavedStates] = useState<{ [key: string]: boolean }>({});

  const handleSaveDestination = async (dest: Destination, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('💾 Starting destination save...');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('👤 Current user:', user);

      if (!user) {
        console.warn('⚠️ No user logged in');
        alert('Please sign in to save destinations!');
        return;
      }

      const destinationData = {
        user_id: user.id,
        name: dest.name,
        country: dest.country,
        image_url: dest.imageUrl
      };

      console.log('📝 Destination data to save:', destinationData);

      const { data, error } = await supabase.from('saved_destinations').insert([destinationData]).select();

      console.log('💾 Insert response:', { data, error });

      if (error) {
        console.error('❌ Error saving destination:', error);
        alert(`Failed to save destination: ${error.message}\n\nCheck console for details.`);
      } else {
        console.log('✅ Destination saved successfully!', data);
        setSavedStates(prev => ({ ...prev, [dest.id]: true }));
        setTimeout(() => {
          setSavedStates(prev => ({ ...prev, [dest.id]: false }));
        }, 2000);
      }
    } catch (err) {
      console.error('❌ Exception while saving:', err);
      alert('An error occurred while saving. Check console for details.');
    }
  };
  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <div className="inline-block px-4 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-bold uppercase tracking-widest mb-4">
            AI Curated
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Top Picks For You</h2>
          <p className="text-white/40 mt-2 text-lg max-w-xl">Based on your interests, budget, and travel party, we believe these gems are perfect matches.</p>
        </div>
        <button onClick={onBack} className="px-6 py-3 rounded-full border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm font-medium">
          Modify Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {suggestions.map((dest, idx) => (
          <div 
            key={dest.id} 
            className="group glass-panel rounded-3xl overflow-hidden hover:border-red-500/30 transition-all duration-500 flex flex-col h-full"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="relative h-64 overflow-hidden">
              <img 
                src={dest.imageUrl} 
                alt={dest.name} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 filter grayscale-[30%] group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-90"></div>
              
              <div className="absolute top-4 left-4 right-4 flex justify-between items-start gap-2">
                <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-white border border-white/10 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {dest.matchScore}% Match
                </div>
                <button
                  onClick={(e) => handleSaveDestination(dest, e)}
                  className={`p-2 backdrop-blur-md rounded-lg border transition-all ${
                    savedStates[dest.id]
                      ? 'bg-green-500/60 border-green-400 text-white'
                      : 'bg-black/60 border-white/10 text-white/80 hover:text-red-400 hover:bg-red-500/20 hover:border-red-400'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${savedStates[dest.id] ? 'fill-current' : ''}`} />
                </button>
              </div>
              
              <div className="absolute bottom-4 left-6">
                <h3 className="text-3xl font-bold text-white mb-1">{dest.name}</h3>
                <p className="text-white/60 text-sm flex items-center gap-2 uppercase tracking-wider font-medium">
                  <MapPin className="w-3 h-3 text-red-400" /> {dest.country}
                </p>
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <p className="text-white/60 text-sm leading-relaxed mb-6 line-clamp-3">
                {dest.description}
              </p>

              <div className="space-y-4 mb-8">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5 group-hover:border-white/10 transition-colors">
                    <span className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">Approx Total</span>
                    <div className="flex items-center gap-1 text-lg text-white font-bold">
                       <IndianRupee className="w-4 h-4 text-green-400" /> {dest.estimatedCost}
                    </div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5 group-hover:border-white/10 transition-colors">
                    <span className="text-[10px] uppercase tracking-wider text-white/30 block mb-1">Flights</span>
                    <div className="flex items-center gap-1 text-lg text-purple-300 font-bold">
                       <Plane className="w-4 h-4" /> {dest.flightPriceEstimate || 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {dest.highlights.slice(0, 3).map((tag, i) => (
                    <span key={i} className="text-xs px-3 py-1.5 bg-white/5 text-white/60 rounded-full border border-white/5">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onSelect(dest)}
                className="w-full mt-auto bg-white text-black hover:bg-gray-200 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
              >
                Generate Plan <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestionList;