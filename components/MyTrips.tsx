
import React, { useEffect, useState } from 'react';
import { Calendar, MoreVertical, ArrowRight, Loader2, PlusCircle, Trash2, X, IndianRupee } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { format } from 'date-fns';
import { Itinerary } from '../types';
import ItineraryView from './ItineraryView';

interface Trip {
  id: string;
  destination: string;
  start_date: string | null;
  end_date: string | null;
  status: 'Upcoming' | 'Completed' | 'Draft';
  image_url: string;
  itinerary_data: Itinerary | null;
  preferences: any;
  created_at: string;
}

const MyTrips: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Upcoming' | 'Draft' | 'Completed'>('All');

  useEffect(() => {
    fetchTrips();
  }, []);

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

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this trip?');
    if (!confirmed) return;

    const { error } = await supabase.from('trips').delete().eq('id', id);
    if (!error) {
      setTrips(prev => prev.filter(t => t.id !== id));

      // Update trip count
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('trips_count')
          .eq('id', user.id)
          .single();

        if (profile && profile.trips_count > 0) {
          await supabase
            .from('profiles')
            .update({ trips_count: profile.trips_count - 1 })
            .eq('id', user.id);
        }
      }
    }
  };

  const handleView = (trip: Trip) => {
    setSelectedTrip(trip);
  };

  const handleClose = () => {
    setSelectedTrip(null);
  };

  const filteredTrips = filterStatus === 'All'
    ? trips
    : trips.filter(t => t.status === filterStatus);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  // Show full itinerary view if one is selected
  if (selectedTrip && selectedTrip.itinerary_data) {
    return (
      <div className="relative">
        <button
          onClick={handleClose}
          className="fixed top-24 right-8 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white p-3 rounded-full transition-all shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>
        <ItineraryView
          itinerary={selectedTrip.itinerary_data}
          onBack={handleClose}
          startDate={selectedTrip.start_date || selectedTrip.preferences?.startDate}
          endDate={selectedTrip.end_date || selectedTrip.preferences?.endDate}
          preferences={selectedTrip.preferences}
        />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Upcoming': return 'bg-green-500/20 text-green-400 border-green-500/20';
      case 'Draft': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20';
      case 'Completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
      default: return 'bg-white/10 text-white/60 border-white/10';
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-4xl font-bold text-white mb-2">My Trips</h2>
          <p className="text-white/40">Your travel history and planned adventures.</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
          {(['All', 'Upcoming', 'Draft', 'Completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterStatus === status
                  ? 'bg-red-500 text-white'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-200 text-center">
          {error}
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
          <h3 className="text-2xl font-bold text-white mb-2">
            {filterStatus === 'All' ? 'No trips yet' : `No ${filterStatus.toLowerCase()} trips`}
          </h3>
          <p className="text-white/40 mb-6">
            {filterStatus === 'All'
              ? 'Start planning your first adventure with Navli AI.'
              : `You don't have any ${filterStatus.toLowerCase()} trips.`}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredTrips.map((trip) => (
            <div key={trip.id} className="glass-panel p-6 rounded-3xl flex flex-col md:flex-row gap-6 group hover:border-red-500/20 transition-all">
              <div className="w-full md:w-80 h-56 md:h-auto rounded-2xl overflow-hidden relative shrink-0">
                <img
                  src={trip.image_url || `https://picsum.photos/seed/${trip.id}/800/400`}
                  alt={trip.destination}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#101015]/80 to-transparent"></div>

                <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border ${getStatusColor(trip.status)}`}>
                  {trip.status}
                </div>

                {trip.itinerary_data && (
                  <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                    <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg text-xs text-white/80 border border-white/20">
                      {trip.itinerary_data.duration} Days
                    </div>
                    <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg text-xs text-white/80 border border-white/20 flex items-center gap-1">
                      <IndianRupee className="w-3 h-3" />
                      {trip.itinerary_data.inrEstimatedCost}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{trip.destination}</h3>
                    <div className="flex items-center gap-4 text-sm text-white/50">
                      {trip.start_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(trip.start_date), 'MMM d, yyyy')}
                          {trip.end_date && ` - ${format(new Date(trip.end_date), 'MMM d')}`}
                        </span>
                      )}
                      {!trip.start_date && <span className="text-white/30">Dates TBD</span>}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(trip.id);
                    }}
                    className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {trip.itinerary_data && (
                  <div className="mb-4">
                    <p className="text-white/60 text-sm leading-relaxed line-clamp-2">
                      {trip.itinerary_data.summary}
                    </p>
                  </div>
                )}

                {trip.itinerary_data && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded-md text-white/50">
                      {trip.itinerary_data.days.length} Day{trip.itinerary_data.days.length > 1 ? 's' : ''}
                    </span>
                    <span className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded-md text-white/50">
                      {trip.itinerary_data.days.reduce((acc, day) => acc + day.activities.length, 0)} Activities
                    </span>
                    {trip.itinerary_data.bookingSuggestions?.flights?.length > 0 && (
                      <span className="text-xs bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-md text-blue-300">
                        {trip.itinerary_data.bookingSuggestions.flights.length} Flight Options
                      </span>
                    )}
                    {trip.itinerary_data.bookingSuggestions?.hotels?.length > 0 && (
                      <span className="text-xs bg-pink-500/10 border border-pink-500/20 px-2 py-1 rounded-md text-pink-300">
                        {trip.itinerary_data.bookingSuggestions.hotels.length} Hotel Options
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-auto flex justify-end gap-3">
                  {trip.itinerary_data ? (
                    <button
                      onClick={() => handleView(trip)}
                      className="px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all flex items-center gap-2 group/btn"
                    >
                      View Full Itinerary <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  ) : (
                    <div className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/40 text-sm">
                      No itinerary saved
                    </div>
                  )}
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
