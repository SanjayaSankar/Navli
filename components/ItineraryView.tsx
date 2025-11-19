import React, { useState } from 'react';
import { Itinerary, ItineraryActivity } from '../types';
import { Calendar, Clock, DollarSign, MapPin, Coffee, Camera, Activity, Plane, Download, BedDouble, ExternalLink, IndianRupee, Share2, Check, Star, Heart } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { supabase } from '../lib/supabaseClient';

interface ItineraryViewProps {
  itinerary: Itinerary;
  onBack: () => void;
  startDate?: string;
  endDate?: string;
  preferences?: any;
}

const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#6366F1'];

const ItineraryView: React.FC<ItineraryViewProps> = ({ itinerary, onBack, startDate, endDate, preferences }) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'booking'>('timeline');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTo, setLastSavedTo] = useState<'trips' | 'saved' | null>(null);

  const handleSaveTrip = async (saveToTrips: boolean) => {
    setIsSaving(true);
    const saveType = saveToTrips ? 'trips' : 'saved';
    console.log(`💾 Starting ${saveType} save...`);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('👤 Current user:', user);

      if (!user) {
        console.warn('⚠️ No user logged in');
        alert('Please sign in to save your trip!');
        setIsSaving(false);
        return;
      }

      const tableName = saveToTrips ? 'trips' : 'saved_itineraries';
      const tripData: any = {
        user_id: user.id,
        destination: itinerary.destinationName,
        image_url: `https://picsum.photos/seed/${itinerary.destinationName}/800/400`,
        itinerary_data: itinerary,
        preferences: preferences || null
      };

      if (saveToTrips) {
        tripData.start_date = startDate || itinerary.days[0]?.date || null;
        tripData.end_date = endDate || itinerary.days[itinerary.days.length - 1]?.date || null;
        tripData.status = 'Draft';
      }

      console.log(`📝 Saving to ${tableName}:`, tripData);

      const { data, error } = await supabase.from(tableName).insert([tripData]).select();

      console.log('💾 Insert response:', { data, error });

      if (error) {
        console.error('❌ Error saving trip:', error);
        alert(`Failed to save: ${error.message}\n\nCheck console for details.`);
      } else {
        console.log(`✅ Trip saved successfully to ${tableName}!`, data);
        setLastSavedTo(saveType);

        // Update trip count in profile only if saving to trips
        if (saveToTrips) {
          console.log('📊 Updating trip count...');
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('trips_count')
            .eq('id', user.id)
            .single();

          console.log('📊 Profile query result:', { profile, profileError });

          if (profile) {
            const updateRes = await supabase
              .from('profiles')
              .update({ trips_count: (profile.trips_count || 0) + 1 })
              .eq('id', user.id);

            console.log('📊 Profile update result:', updateRes);
          }
        }

        setTimeout(() => setLastSavedTo(null), 2000);
      }
    } catch (err) {
      console.error('❌ Exception while saving:', err);
      alert('An error occurred while saving. Check console for details.');
    } finally {
      setIsSaving(false);
    }
  };

  const getActivityIcon = (type: ItineraryActivity['type']) => {
    switch (type) {
      case 'food': return <Coffee className="w-4 h-4 text-pink-400" />;
      case 'sightseeing': return <Camera className="w-4 h-4 text-purple-400" />;
      case 'activity': return <Activity className="w-4 h-4 text-green-400" />;
      case 'travel': return <Plane className="w-4 h-4 text-blue-400" />;
      default: return <MapPin className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      {/* Hero Section */}
      <div className="relative rounded-[2.5rem] overflow-hidden mb-12 bg-white/5 border border-white/5 min-h-[300px] flex flex-col justify-end p-8 md:p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-red-900/40 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4 max-w-3xl">
            <button onClick={onBack} className="text-white/50 hover:text-white text-sm font-medium transition-colors flex items-center gap-2">
              ← Back to suggestions
            </button>
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter">
              {itinerary.destinationName}
            </h1>
            <p className="text-xl text-white/80 leading-relaxed border-l-4 border-red-500 pl-4">
              {itinerary.summary}
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white p-3 rounded-xl backdrop-blur-sm transition-all">
              <Share2 className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSaveTrip(true)}
                disabled={isSaving}
                className={`px-6 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 ${
                  lastSavedTo === 'trips'
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white disabled:opacity-50'
                }`}
              >
                {lastSavedTo === 'trips' ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Trips!
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Add to My Trips'}
                  </>
                )}
              </button>

              <button
                onClick={() => handleSaveTrip(false)}
                disabled={isSaving}
                className={`px-6 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 ${
                  lastSavedTo === 'saved'
                    ? 'bg-green-500 text-white'
                    : 'bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-50'
                }`}
              >
                {lastSavedTo === 'saved' ? (
                  <>
                    <Check className="w-4 h-4" /> Saved!
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save for Later'}
                  </>
                )}
              </button>
            </div>

            <button className="bg-white text-black hover:bg-gray-200 px-6 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2">
              <Download className="w-4 h-4" /> Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-8 mb-10 border-b border-white/10 px-4">
        <button 
          onClick={() => setActiveTab('timeline')}
          className={`pb-4 px-2 text-lg font-medium transition-all relative ${activeTab === 'timeline' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
        >
          Timeline
          {activeTab === 'timeline' && <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-purple-500 rounded-t-full shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('booking')}
          className={`pb-4 px-2 text-lg font-medium transition-all relative ${activeTab === 'booking' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
        >
          Flights & Hotels
          {activeTab === 'booking' && <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-purple-500 rounded-t-full shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Content Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {activeTab === 'timeline' && itinerary.days.map((day) => (
            <div key={day.day} className="glass-panel rounded-3xl overflow-hidden">
              <div className="bg-white/5 px-8 py-6 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center gap-4">
                  <span className="bg-red-500 text-white w-8 h-8 flex items-center justify-center rounded-lg text-sm shadow-lg shadow-red-500/20">{day.day}</span>
                  {day.title}
                </h3>
                {day.date && <span className="text-sm text-white/30 font-mono border border-white/10 px-3 py-1 rounded-full">{day.date}</span>}
              </div>
              <div className="p-8 space-y-8">
                {day.activities.map((act, idx) => (
                  <div key={idx} className="relative pl-8 border-l border-white/10 last:border-0">
                    <div className="absolute -left-[20px] top-0 w-10 h-10 rounded-full bg-[#15151a] border border-white/10 flex items-center justify-center shadow-lg z-10">
                      {getActivityIcon(act.type)}
                    </div>
                    
                    <div className="mb-1">
                      <span className="text-xs font-bold text-red-400 tracking-widest uppercase mb-1 block">{act.time}</span>
                      <h4 className="text-lg font-bold text-white">{act.activity}</h4>
                    </div>
                    <p className="text-white/60 text-sm mb-3 leading-relaxed">{act.description}</p>
                    <div className="flex flex-wrap gap-3">
                       {act.location && (
                        <span className="flex items-center gap-1 text-xs text-white/40 bg-white/5 px-2 py-1 rounded-md">
                          <MapPin className="w-3 h-3" /> {act.location}
                        </span>
                      )}
                      {act.cost && (
                        <span className="flex items-center gap-1 text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded-md border border-green-500/20">
                          <DollarSign className="w-3 h-3" /> {act.cost}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {activeTab === 'booking' && (
            <div className="space-y-8">
              
              {/* Flights Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Plane className="w-5 h-5 text-blue-400" /> Flight Options
                </h3>
                <div className="grid gap-4">
                  {itinerary.bookingSuggestions.flights.map((flight, idx) => (
                    <div key={idx} className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-blue-500/30 transition-all">
                      <div className="flex-1">
                         <div className="flex items-center gap-3 mb-2">
                           <span className="text-lg font-bold text-white">{flight.airline}</span>
                           {idx === 0 && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/20">Recommended</span>}
                         </div>
                         <div className="flex gap-4 text-sm text-white/50">
                            <span>{flight.duration}</span>
                            <span>•</span>
                            <span>{flight.stops}</span>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="text-2xl font-bold text-white mb-1">{flight.price}</div>
                         <a 
                            href={flight.bookingUrl}
                            target="_blank"
                            rel="noreferrer" 
                            className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors"
                          >
                           Check <ExternalLink className="w-3 h-3" />
                         </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hotels Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <BedDouble className="w-5 h-5 text-pink-400" /> Top Rated Stays
                </h3>
                <div className="grid gap-4">
                   {itinerary.bookingSuggestions.hotels.map((hotel, idx) => (
                    <div key={idx} className="glass-panel p-6 rounded-2xl group hover:border-pink-500/30 transition-all">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-white mb-1">{hotel.name}</h4>
                          <p className="text-sm text-white/50 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {hotel.address}
                          </p>
                        </div>
                        <div className="text-right">
                           <div className="text-xl font-bold text-white">{hotel.price}</div>
                           <div className="text-xs text-yellow-400 font-bold flex items-center justify-end gap-1">
                             <Star className="w-3 h-3 fill-current" /> {hotel.rating}
                           </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        {hotel.features && hotel.features.map((feature, i) => (
                          <span key={i} className="text-xs bg-white/5 px-2 py-1 rounded text-white/60 border border-white/5">{feature}</span>
                        ))}
                      </div>

                      <a 
                        href={hotel.bookingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full block text-center py-3 rounded-xl bg-white/5 hover:bg-pink-500/20 hover:text-pink-200 text-white/80 border border-white/10 transition-all font-medium"
                      >
                        View Availability
                      </a>
                    </div>
                   ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-8 sticky top-24">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-6">Trip Financials</h3>
            
            <div className="mb-8">
              <span className="text-sm text-white/60 block mb-1">Estimated Total Cost</span>
              <div className="text-4xl font-bold text-white flex items-center gap-1">
                <IndianRupee className="w-8 h-8 text-white/40" />
                {itinerary.inrEstimatedCost.replace(/[^\d,]/g, '')}
              </div>
              <p className="text-xs text-white/30 mt-2">For {itinerary.duration} days • {itinerary.currency} equivalent included</p>
            </div>
            
            <div className="h-48 w-full mb-6 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={itinerary.budgetBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="amount"
                    stroke="none"
                  >
                    {itinerary.budgetBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `₹${value}`}
                    contentStyle={{ 
                      backgroundColor: '#101015', 
                      borderRadius: '12px', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-xs font-bold text-white/20">Breakdown</span>
              </div>
            </div>

            <div className="space-y-3">
              {itinerary.budgetBreakdown.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    <span className="text-white/70">{item.category}</span>
                  </div>
                  <span className="font-medium text-white">₹{item.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryView;