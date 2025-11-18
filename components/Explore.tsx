
import React, { useEffect, useState } from 'react';
import { MapPin, Star, Heart, Loader2 } from 'lucide-react';
import { getTrendingDestinations } from '../services/geminiService';

const Explore: React.FC = () => {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      const data = await getTrendingDestinations();
      setDestinations(data);
      setLoading(false);
    };
    fetchTrending();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 h-96">
        <Loader2 className="w-10 h-10 text-red-500 animate-spin mb-4" />
        <p className="text-white/50">Curating global trending spots...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-2">Explore the World</h2>
        <p className="text-white/40">Trending destinations curated by Navli AI live.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map((dest) => (
          <div key={dest.id} className="group relative h-[400px] rounded-3xl overflow-hidden cursor-pointer">
            <img src={dest.image} alt={dest.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>
            
            <button className="absolute top-4 right-4 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/70 hover:text-red-500 hover:bg-white/20 transition-all">
              <Heart className="w-5 h-5" />
            </button>

            <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{dest.name}</h3>
                  <p className="text-white/60 flex items-center gap-1 text-sm">
                    <MapPin className="w-3 h-3 text-red-400" /> {dest.country}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-yellow-400 font-bold bg-black/30 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/10">
                  <Star className="w-4 h-4 fill-current" /> {dest.rating}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Explore;
