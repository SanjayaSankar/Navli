
import React, { useEffect, useState } from 'react';
import { MapPin, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const Saved: React.FC = () => {
  const [savedPlaces, setSavedPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        setError("Please sign in to view saved items.");
        return;
      }

      const { data, error } = await supabase
        .from('saved_destinations')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error(error);
        setError("Could not load saved items.");
      } else {
        setSavedPlaces(data || []);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
     const { error } = await supabase.from('saved_destinations').delete().eq('id', id);
     if(!error) {
        setSavedPlaces(prev => prev.filter(p => p.id !== id));
     }
  };

  if (loading) {
     return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-500" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end mb-8">
         <div>
            <h2 className="text-4xl font-bold text-white mb-2">Saved Gems</h2>
            <p className="text-white/40">Your personal wishlist of destinations.</p>
         </div>
         <div className="text-right">
            <span className="text-4xl font-bold text-red-400">{savedPlaces.length}</span>
            <p className="text-xs uppercase tracking-wider text-white/40">Items Saved</p>
         </div>
      </div>

      {savedPlaces.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-3xl">
            <p className="text-white/50">No saved destinations found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {savedPlaces.map((place) => (
            <div key={place.id} className="glass-panel rounded-3xl overflow-hidden group relative flex flex-col">
              <div className="h-64 relative overflow-hidden">
                <img src={place.image_url || `https://picsum.photos/seed/${place.id}/800/600`} alt={place.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#101015] to-transparent opacity-90"></div>
                <button 
                  onClick={() => handleDelete(place.id)}
                  className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-md rounded-full text-white/50 hover:text-red-500 hover:bg-white/10 transition-all"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-6 -mt-12 relative z-10 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-white mb-1">{place.name}</h3>
                {place.country && (
                  <p className="text-white/60 text-sm flex items-center gap-1 mb-4">
                    <MapPin className="w-3 h-3 text-red-400" /> {place.country}
                  </p>
                )}
                <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                    <button className="text-sm font-bold text-white flex items-center gap-1 group/link hover:gap-2 transition-all">
                      View <ArrowRight className="w-3 h-3 text-red-400" />
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Saved;
