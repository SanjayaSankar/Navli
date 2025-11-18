
import React, { useEffect, useState } from 'react';
import { User, Map, Plane, Award, Edit2, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile({ ...data, email: user.email });
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-white" /></div>;

  if (!profile) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <h2 className="text-2xl font-bold text-white mb-4">Guest Mode</h2>
        <p className="text-white/50 mb-6">Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="relative mb-20">
        <div className="h-48 w-full bg-gradient-to-r from-red-900/40 to-purple-900/40 rounded-3xl border border-white/5 overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        </div>
        <div className="absolute -bottom-12 left-8 flex items-end gap-6">
          <div className="w-32 h-32 rounded-2xl bg-[#101015] p-1.5 border border-white/10">
            <img src={profile.avatar_url || "https://i.pravatar.cc/300?img=12"} alt="Profile" className="w-full h-full rounded-xl object-cover" />
          </div>
          <div className="mb-3">
            <h2 className="text-3xl font-bold text-white">{profile.full_name || 'Traveler'}</h2>
            <p className="text-white/40">{profile.email}</p>
          </div>
        </div>
        <button className="absolute bottom-4 right-8 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-all flex items-center gap-2">
          <Edit2 className="w-4 h-4" /> Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass-panel p-6 rounded-2xl text-center group hover:border-red-500/30 transition-all">
          <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
             <Plane className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold text-white">{profile.trips_count || 0}</div>
          <div className="text-xs uppercase tracking-wider text-white/40">Trips Taken</div>
        </div>
        {/* Mock stats for visual balance, but connected to real user id logically if we extended DB */}
        <div className="glass-panel p-6 rounded-2xl text-center group hover:border-purple-500/30 transition-all">
          <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
             <Map className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold text-white">--</div>
          <div className="text-xs uppercase tracking-wider text-white/40">Countries</div>
        </div>
        <div className="glass-panel p-6 rounded-2xl text-center group hover:border-yellow-500/30 transition-all">
          <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
             <Award className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold text-white">New</div>
          <div className="text-xs uppercase tracking-wider text-white/40">Traveler Rank</div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
