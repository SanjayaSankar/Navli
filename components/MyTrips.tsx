
import React, { useEffect, useState } from 'react';
import { Calendar, Clock, MoreVertical, ArrowRight, Loader2, PlusCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { format } from 'date-fns';

const MyTrips: React.FC = () => {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        setError("Please sign in to view your trips.");
        return;
      }

      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching trips:", error);
        setError("Could not load your trips.");
      } else {
        setTrips(data || []);
      }
      setLoading(false);
    };

    fetchTrips();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-bold text-white mb-2">My Trips</h2>
          <p className="text-white/40">Manage your upcoming adventures and look back at memories.</p>
        </div>
        <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center gap-2 transition-colors">
           <PlusCircle className="w-4 h-4" /> New Trip
        </button>
      </div>

      {error ? (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-200 text-center">
          {error}
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
          <h3 className="text-2xl font-bold text-white mb-2">No trips yet</h3>
          <p className="text-white/40 mb-6">Start planning your first adventure with Navli AI.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {trips.map((trip) => (
            <div key={trip.id} className="glass-panel p-4 rounded-3xl flex flex-col md:flex-row gap-6 group hover:border-red-500/20 transition-all">
              <div className="w-full md:w-64 h-48 md:h-auto rounded-2xl overflow-hidden relative shrink-0">
                <img src={trip.image_url || `https://picsum.photos/seed/${trip.id}/800/400`} alt={trip.destination} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border border-white/10 ${
                  trip.status === 'Upcoming' ? 'bg-green-500/20 text-green-400' :
                  trip.status === 'Draft' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-white/10 text-white/60'
                }`}>
                  {trip.status || 'Draft'}
                </div>
              </div>
              
              <div className="flex-1 py-2 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">{trip.destination}</h3>
                    <div className="flex items-center gap-4 text-sm text-white/50">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> 
                        {trip.start_date ? format(new Date(trip.start_date), 'MMM d, yyyy') : 'Dates TBD'}
                      </span>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-white/5 rounded-full text-white/40 transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-auto pt-4 flex justify-end items-end">
                   <button className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all flex items-center gap-2 group/btn">
                     View Itinerary <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
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

export default MyTrips;
