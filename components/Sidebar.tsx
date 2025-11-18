import React from 'react';
import { Home, Map, Heart, User, Settings, LogOut, X, Briefcase } from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentView, onNavigate, onLogout }) => {
  const menuItems = [
    { icon: Home, label: AppView.Home, id: AppView.Home },
    { icon: Briefcase, label: AppView.MyTrips, id: AppView.MyTrips },
    { icon: Heart, label: AppView.Saved, id: AppView.Saved },
    { icon: Map, label: AppView.Explore, id: AppView.Explore },
    { icon: User, label: AppView.Profile, id: AppView.Profile },
    { icon: Settings, label: AppView.Settings, id: AppView.Settings },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-72 glass-sidebar z-50 transform transition-transform duration-500 ease-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex justify-between items-center border-b border-white/5">
          <span className="text-xl font-bold text-white/90">Menu</span>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                onClose();
              }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group relative overflow-hidden ${
                currentView === item.id 
                  ? 'bg-white/10 text-white border border-white/5 shadow-[0_0_15px_rgba(220,38,38,0.1)]' 
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
               <div className={`absolute inset-0 bg-gradient-to-r from-red-500/10 to-purple-500/10 transition-opacity ${currentView === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
              <item.icon className={`w-5 h-5 relative z-10 transition-colors ${currentView === item.id ? 'text-red-400' : 'group-hover:text-red-400'}`} />
              <span className="font-medium relative z-10">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6 border-t border-white/5">
          <div className="bg-gradient-to-br from-purple-900/50 to-red-900/50 rounded-xl p-4 mb-4 border border-white/10">
            <h4 className="font-bold text-sm mb-1">Pro Plan</h4>
            <p className="text-xs text-white/60 mb-3">Get access to advanced AI models and unlimited trips.</p>
            <button className="w-full py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-gray-200 transition-colors">
              Upgrade
            </button>
          </div>
          
          <button
            onClick={() => {
              onLogout?.();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;