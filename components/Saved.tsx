
import React, { useEffect, useState } from 'react';
import { MapPin, Trash2, ArrowRight, Loader2, Calendar, IndianRupee, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Itinerary } from '../types';
import ItineraryView from './ItineraryView';

interface SavedItinerary {
  id: string;
  destination: string;
  image_url: string;
  itinerary_data: Itinerary;
  preferences: any;
  created_at: string;
}

const Saved: React.FC = () => {
  const [savedItineraries, setSavedItineraries] = useState<SavedItinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItinerary, setSelectedItinerary] = useState<SavedItinerary | null>(null);

  useEffect(() => {
    fetchSavedItineraries();
  }, []);

  const fetchSavedItineraries = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      setError("Please sign in to view saved items.");
      return;
    }

    const { data, error } = await supabase
      .from('saved_itineraries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setError("Could not load saved items.");
    } else {
      setSavedItineraries(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this saved itinerary?');
    if (!confirmed) return;

    const { error } = await supabase.from('saved_itineraries').delete().eq('id', id);
    if (!error) {
      setSavedItineraries(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleView = (itinerary: SavedItinerary) => {
    setSelectedItinerary(itinerary);
  };

  const handleClose = () => {
    setSelectedItinerary(null);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-500" /></div>;
  }

  // Show full itinerary view if one is selected
  if (selectedItinerary) {
    return (
      <div className="relative">
        <button
          onClick={handleClose}
          className="fixed top-24 right-8 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white p-3 rounded-full transition-all shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>
        <ItineraryView
          itinerary={selectedItinerary.itinerary_data}
          onBack={handleClose}
          startDate={selectedItinerary.preferences?.startDate}
          endDate={selectedItinerary.preferences?.endDate}
          preferences={selectedItinerary.preferences}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-4xl font-bold text-white mb-2">Saved Itineraries</h2>
          <p className="text-white/40">Your collection of dream destinations and complete travel plans.</p>
        </div>
        <div className="text-right">
          <span className="text-4xl font-bold text-purple-400">{savedItineraries.length}</span>
          <p className="text-xs uppercase tracking-wider text-white/40">Saved Plans</p>
        </div>
      </div>

      {error ? (
        <div className="text-center py-20 bg-red-500/10 border border-red-500/20 rounded-3xl">
          <p className="text-red-200">{error}</p>
        </div>
      ) : savedItineraries.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-3xl">
          <p className="text-white/50 mb-2">No saved itineraries yet.</p>
          <p className="text-white/30 text-sm">Generate a trip and click "Save for Later" to bookmark your favorite itineraries.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedItineraries.map((item) => {
            const itinerary = item.itinerary_data;
            return (
              <div key={item.id} className="glass-panel rounded-3xl overflow-hidden group relative flex flex-col hover:border-purple-500/30 transition-all">
                <div className="h-56 relative overflow-hidden">
                  <img
                    src={item.image_url || `https://picsum.photos/seed/${item.destination}/800/600`}
                    alt={item.destination}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101015] via-[#101015]/60 to-transparent opacity-90"></div>

                  {/* Quick Stats Overlay */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                    <div className="bg-purple-500/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-purple-300/20">
                      {itinerary.duration} Days
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white/50 hover:text-red-500 hover:bg-white/10 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-2xl font-bold text-white mb-1">{item.destination}</h3>
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                      <IndianRupee className="w-3 h-3" />
                      <span>{itinerary.inrEstimatedCost}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-white/60 text-sm leading-relaxed mb-4 line-clamp-2">
                    {itinerary.summary}
                  </p>

                  {/* Quick Info Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded-md text-white/50">
                      {itinerary.days.length} Day{itinerary.days.length > 1 ? 's' : ''}
                    </span>
                    <span className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded-md text-white/50">
                      {itinerary.days.reduce((acc, day) => acc + day.activities.length, 0)} Activities
                    </span>
                    {itinerary.bookingSuggestions?.flights?.length > 0 && (
                      <span className="text-xs bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-md text-blue-300">
                        {itinerary.bookingSuggestions.flights.length} Flights
                      </span>
                    )}
                    {itinerary.bookingSuggestions?.hotels?.length > 0 && (
                      <span className="text-xs bg-pink-500/10 border border-pink-500/20 px-2 py-1 rounded-md text-pink-300">
                        {itinerary.bookingSuggestions.hotels.length} Hotels
                      </span>
                    )}
                  </div>

                  <div className="mt-auto pt-4 border-t border-white/5">
                    <button
                      onClick={() => handleView(item)}
                      className="w-full text-sm font-bold text-white flex items-center justify-center gap-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl py-3 group/btn transition-all"
                    >
                      View Full Itinerary <ArrowRight className="w-4 h-4 text-purple-400 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Saved;
